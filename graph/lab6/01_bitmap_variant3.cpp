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

#include <array>
#include <cstdint>
#include <random>
#include <vector>

namespace {
constexpr int kBitmapW = 24;
constexpr int kBitmapH = 24;
constexpr int kGridSize = 6;
constexpr int kWindowW = 900;
constexpr int kWindowH = 900;
constexpr int kRowBytes = (kBitmapW + 7) / 8;

std::array<GLubyte, kBitmapH * kRowBytes> gBitmap{};
std::vector<GLfloat> gColors;
int gWinW = kWindowW;
int gWinH = kWindowH;
}

void BuildBitmap() {
    
    for (int y = 0; y < kBitmapH; ++y) {
        for (int x = 0; x < kBitmapW; ++x) {
            const bool border = (x == 0 || y == 0 || x == kBitmapW - 1 || y == kBitmapH - 1);
            const bool diag1 = (x == y);
            const bool diag2 = (x == (kBitmapW - 1 - y));
            const bool cross = (x == kBitmapW / 2 || y == kBitmapH / 2);
            const bool bitOn = border || diag1 || diag2 || cross;
            if (!bitOn) {
                continue;
            }

            const int byteIdx = y * kRowBytes + (x / 8);
            const int bitIdx = x % 8;
            gBitmap[byteIdx] |= static_cast<GLubyte>(1u << bitIdx);
        }
    }
}

void GenerateColors() {
    std::mt19937 rng(2026);
    std::uniform_real_distribution<float> dist(0.2f, 1.0f);
    gColors.resize(kGridSize * kGridSize * 3);
    for (size_t i = 0; i < gColors.size(); ++i) {
        gColors[i] = dist(rng);
    }
}

void SetupRC() {
    glClearColor(0.05f, 0.05f, 0.08f, 1.0f);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    BuildBitmap();
    GenerateColors();
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

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    const int totalW = kGridSize * kBitmapW;
    const int totalH = kGridSize * kBitmapH;
    const int startX = (gWinW - totalW) / 2;
    const int startY = (gWinH - totalH) / 2;

    for (int row = 0; row < kGridSize; ++row) {
        for (int col = 0; col < kGridSize; ++col) {
            const int idx = (row * kGridSize + col) * 3;
            glColor3f(gColors[idx + 0], gColors[idx + 1], gColors[idx + 2]);

            const int x = startX + col * kBitmapW;
            const int y = startY + row * kBitmapH;
            glRasterPos2i(x, y);
            glBitmap(kBitmapW, kBitmapH, 0.0f, 0.0f, 0.0f, 0.0f, gBitmap.data());
        }
    }

    glutSwapBuffers();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(kWindowW, kWindowH);
    glutCreateWindow("Lab6 Task1 Variant3 - 24x24 bitmap 6x6 center");

    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);

    SetupRC();
    glutMainLoop();
    return 0;
}
