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

#include <cmath>
#include <cstdio>

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#define NUM_FACES 5
#define SECTION_LEN 8.0f
#define NUM_SECTIONS 10

GLuint textures[NUM_FACES];
static GLfloat zPos = -4.0f;

const char* kTextureFiles[NUM_FACES] = {
    "textures/corridor_floor.tga",
    "textures/corridor_right_bottom.tga",
    "textures/corridor_right_vertical.tga",
    "textures/corridor_top.tga",
    "textures/corridor_left_slant.tga",
};


static const float crossX[5] = {-1.15f, -0.35f, 0.95f, 0.95f, -0.35f};
static const float crossY[5] = {0.0f, 0.85f, 0.85f, -0.85f, -0.85f};
#define SCALE 6.5f

void MakeFallbackTexture(int faceIndex) {
    unsigned char pixels[64 * 64 * 3];
    const unsigned char base[NUM_FACES][3] = {
        {120, 92, 45}, {90, 120, 165}, {145, 145, 155}, {185, 185, 165}, {125, 95, 70},
    };
    for (int y = 0; y < 64; ++y) {
        for (int x = 0; x < 64; ++x) {
            const int idx = (y * 64 + x) * 3;
            const int l = ((x / 8 + y / 8) % 2) ? 22 : -22;
            const int r = base[faceIndex][0] + l;
            const int g = base[faceIndex][1] + l;
            const int b = base[faceIndex][2] + l;
            pixels[idx + 0] = static_cast<unsigned char>(r < 0 ? 0 : (r > 255 ? 255 : r));
            pixels[idx + 1] = static_cast<unsigned char>(g < 0 ? 0 : (g > 255 ? 255 : g));
            pixels[idx + 2] = static_cast<unsigned char>(b < 0 ? 0 : (b > 255 ? 255 : b));
        }
    }
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 64, 64, 0, GL_RGB, GL_UNSIGNED_BYTE, pixels);
}

void SetupTextures() {
    glGenTextures(NUM_FACES, textures);
    stbi_set_flip_vertically_on_load(1);
    for (int i = 0; i < NUM_FACES; ++i) {
        glBindTexture(GL_TEXTURE_2D, textures[i]);
        int w = 0;
        int h = 0;
        int ch = 0;
        unsigned char* data = stbi_load(kTextureFiles[i], &w, &h, &ch, 0);
        if (!data) {
            std::fprintf(stderr, "Не найдена %s, используется procedural texture\n", kTextureFiles[i]);
            MakeFallbackTexture(i);
        } else {
            const GLenum fmt = (ch == 4) ? GL_RGBA : ((ch == 1) ? GL_LUMINANCE : GL_RGB);
            glTexImage2D(GL_TEXTURE_2D, 0, fmt, w, h, 0, fmt, GL_UNSIGNED_BYTE, data);
            stbi_image_free(data);
        }
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    }
}

void DrawFaceSection(int faceIndex, float z0, float z1) {
    const int a = faceIndex;
    const int b = (faceIndex + 1) % 5;
    const float x0 = crossX[a] * SCALE;
    const float y0 = crossY[a] * SCALE;
    const float x1 = crossX[b] * SCALE;
    const float y1 = crossY[b] * SCALE;
    const float edgeLen = std::sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    const float sScale = edgeLen / 6.0f;
    const float t0 = (-z0) / SECTION_LEN;
    const float t1 = (-z1) / SECTION_LEN;

    glBindTexture(GL_TEXTURE_2D, textures[faceIndex]);
    glBegin(GL_QUADS);
    glTexCoord2f(0.0f, t0); glVertex3f(x0, y0, z0);
    glTexCoord2f(sScale, t0); glVertex3f(x1, y1, z0);
    glTexCoord2f(sScale, t1); glVertex3f(x1, y1, z1);
    glTexCoord2f(0.0f, t1); glVertex3f(x0, y0, z1);
    glEnd();
}

void DrawCorridor() {
    for (int sec = 0; sec < NUM_SECTIONS; ++sec) {
        const float z0 = -static_cast<float>(sec) * SECTION_LEN;
        const float z1 = z0 - SECTION_LEN;
        for (int f = 0; f < NUM_FACES; ++f) DrawFaceSection(f, z0, z1);
    }
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glTranslatef(0.0f, 0.0f, zPos);
    DrawCorridor();
    glutSwapBuffers();
}

void SpecialKeys(int key, int, int) {
    if (key == GLUT_KEY_UP) zPos -= 1.0f;
    if (key == GLUT_KEY_DOWN) zPos += 1.0f;
    glutPostRedisplay();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(90.0f, static_cast<float>(w) / static_cast<float>(h), 0.5f, 250.0f);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void ProcessMenu(int value) {
    GLenum filterMode = GL_LINEAR;
    switch (value) {
        case 0: filterMode = GL_NEAREST; break;
        case 1: filterMode = GL_LINEAR; break;
        case 2: filterMode = GL_NEAREST_MIPMAP_NEAREST; break;
        case 3: filterMode = GL_NEAREST_MIPMAP_LINEAR; break;
        case 4: filterMode = GL_LINEAR_MIPMAP_NEAREST; break;
        case 5: filterMode = GL_LINEAR_MIPMAP_LINEAR; break;
    }
    for (int i = 0; i < NUM_FACES; ++i) {
        glBindTexture(GL_TEXTURE_2D, textures[i]);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, filterMode);
    }
    glutPostRedisplay();
}

void SetupRC() {
    glClearColor(0.01f, 0.01f, 0.01f, 1.0f);
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_TEXTURE_2D);
    glTexEnvi(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE);
    SetupTextures();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(900, 640);
    glutCreateWindow("Lab5 #3 - Corridor variant shape with 5 TGA textures");
    glutReshapeFunc(ChangeSize);
    glutSpecialFunc(SpecialKeys);
    glutDisplayFunc(RenderScene);

    glutCreateMenu(ProcessMenu);
    glutAddMenuEntry("GL_NEAREST", 0);
    glutAddMenuEntry("GL_LINEAR", 1);
    glutAddMenuEntry("GL_NEAREST_MIPMAP_NEAREST", 2);
    glutAddMenuEntry("GL_NEAREST_MIPMAP_LINEAR", 3);
    glutAddMenuEntry("GL_LINEAR_MIPMAP_NEAREST", 4);
    glutAddMenuEntry("GL_LINEAR_MIPMAP_LINEAR", 5);
    glutAttachMenu(GLUT_RIGHT_BUTTON);

    SetupRC();
    glutMainLoop();
    return 0;
}