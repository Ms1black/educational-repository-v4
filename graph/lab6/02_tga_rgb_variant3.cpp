#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <GLUT/glut.h>
#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#else
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#endif

#include <cstdio>
#include <cstdlib>
#include <cstring>

namespace {
GLubyte* gImage = nullptr;
GLint gImgW = 0;
GLint gImgH = 0;
GLint gComponents = 0;
GLenum gFormat = GL_RGB;
int gWinW = 1200;
int gWinH = 900;
}

GLubyte* LoadTGA(const char* fileName, GLint* w, GLint* h, GLint* comps, GLenum* format) {
    *w = 0;
    *h = 0;
    *comps = GL_RGB8;
    *format = GL_BGR;

    FILE* file = std::fopen(fileName, "rb");
    if (!file) {
        return nullptr;
    }

    unsigned char header[18]{};
    if (std::fread(header, 18, 1, file) != 1) {
        std::fclose(file);
        return nullptr;
    }

    const unsigned char imageType = header[2];
    if (imageType != 2 && imageType != 3) {
        std::fclose(file);
        return nullptr;
    }

    const int imgW = static_cast<int>(header[12] | (header[13] << 8));
    const int imgH = static_cast<int>(header[14] | (header[15] << 8));
    const unsigned char bitsPerPixel = header[16];
    const short depth = static_cast<short>(bitsPerPixel / 8);

    if (bitsPerPixel != 8 && bitsPerPixel != 24 && bitsPerPixel != 32) {
        std::fclose(file);
        return nullptr;
    }

    *w = imgW;
    *h = imgH;
    const size_t imageSize = static_cast<size_t>(*w) * static_cast<size_t>(*h) * static_cast<size_t>(depth);
    auto* bits = static_cast<GLubyte*>(std::malloc(imageSize));
    if (!bits) {
        std::fclose(file);
        return nullptr;
    }

    if (std::fread(bits, imageSize, 1, file) != 1) {
        std::free(bits);
        std::fclose(file);
        return nullptr;
    }
    std::fclose(file);

    switch (depth) {
        case 1:
            *format = GL_LUMINANCE;
            *comps = GL_LUMINANCE8;
            break;
        case 3:
            *format = GL_BGR;
            *comps = GL_RGB8;
            break;
        case 4:
            *format = GL_BGRA;
            *comps = GL_RGBA8;
            break;
    }
    return bits;
}

void CreateFallbackImage() {
    gImgW = 256;
    gImgH = 256;
    gComponents = GL_RGB8;
    gFormat = GL_RGB;
    gImage = static_cast<GLubyte*>(std::malloc(static_cast<size_t>(gImgW) * static_cast<size_t>(gImgH) * 3u));
    if (!gImage) {
        return;
    }

    for (int y = 0; y < gImgH; ++y) {
        for (int x = 0; x < gImgW; ++x) {
            const int idx = (y * gImgW + x) * 3;
            gImage[idx + 0] = static_cast<GLubyte>(x % 256);
            gImage[idx + 1] = static_cast<GLubyte>(y % 256);
            gImage[idx + 2] = static_cast<GLubyte>(((x + y) / 2) % 256);
        }
    }
}

void SetupRC() {
    glClearColor(0.02f, 0.02f, 0.02f, 1.0f);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    gImage = LoadTGA("5146f04aee6c90864227c1a639c65b5a.tga", &gImgW, &gImgH, &gComponents, &gFormat);
    if (!gImage) {
        std::fprintf(stderr, "Cannot load 5146f04aee6c90864227c1a639c65b5a.tga, using fallback image\n");
        CreateFallbackImage();
    }
}

void ShutdownRC() {
    if (gImage) {
        std::free(gImage);
        gImage = nullptr;
    }
}

void ChangeSize(int w, int h) {
    if (h == 0) {
        h = 1;
    }
    gWinW = w;
    gWinH = h;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluOrtho2D(0.0, static_cast<GLdouble>(w), 0.0, static_cast<GLdouble>(h));
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void DrawWithChannelMask(int mode, int x, int y) {
    glWindowPos2i(x, y);

    glPixelTransferf(GL_RED_SCALE, 1.0f);
    glPixelTransferf(GL_GREEN_SCALE, 1.0f);
    glPixelTransferf(GL_BLUE_SCALE, 1.0f);

    if (mode == 1) {
        glPixelTransferf(GL_GREEN_SCALE, 0.0f);
        glPixelTransferf(GL_BLUE_SCALE, 0.0f);
    } else if (mode == 2) {
        glPixelTransferf(GL_RED_SCALE, 0.0f);
        glPixelTransferf(GL_BLUE_SCALE, 0.0f);
    } else if (mode == 3) {
        glPixelTransferf(GL_RED_SCALE, 0.0f);
        glPixelTransferf(GL_GREEN_SCALE, 0.0f);
    }

    glDrawPixels(gImgW, gImgH, gFormat, GL_UNSIGNED_BYTE, gImage);
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    if (!gImage) {
        glutSwapBuffers();
        return;
    }

    const int gap = 20;
    const float fitScaleX = static_cast<float>(gWinW - 5 * gap) / static_cast<float>(4 * gImgW);
    const float fitScaleY = static_cast<float>(gWinH - 5 * gap) / static_cast<float>(4 * gImgH);
    float drawScale = fitScaleX < fitScaleY ? fitScaleX : fitScaleY;
    if (drawScale > 1.0f) {
        drawScale = 1.0f;
    }
    if (drawScale < 0.05f) {
        drawScale = 0.05f;
    }

    const int drawW = static_cast<int>(gImgW * drawScale);
    const int drawH = static_cast<int>(gImgH * drawScale);
    const int startX = gWinW - gap - drawW;
    const int startY = gWinH - gap - drawH;

    glPixelZoom(drawScale, drawScale);

    
    for (int i = 0; i < 4; ++i) {
        const int x = startX - i * (drawW + gap);
        const int y = startY - i * (drawH + gap);
        DrawWithChannelMask(i, x, y);
    }

    glPixelTransferf(GL_RED_SCALE, 1.0f);
    glPixelTransferf(GL_GREEN_SCALE, 1.0f);
    glPixelTransferf(GL_BLUE_SCALE, 1.0f);
    glPixelZoom(1.0f, 1.0f);
    glutSwapBuffers();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(gWinW, gWinH);
    glutCreateWindow("Lab6 Task2 Variant3 - TGA + RGB components");

    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);

    SetupRC();
    glutMainLoop();
    ShutdownRC();
    return 0;
}
