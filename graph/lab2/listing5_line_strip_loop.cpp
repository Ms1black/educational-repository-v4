#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <GL/glew.h>
#include <GLUT/glut.h>
#else
#include "glew.h"
#include "glut.h"
#endif

#include <cmath>

static const GLfloat kPi = 3.1415926f;
static GLfloat xRot = 20.0f;
static GLfloat yRot = -20.0f;

void changeSize(GLsizei w, GLsizei h) {
    GLfloat nRange = 100.0f;
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    if (w <= h) glOrtho(-nRange, nRange, -nRange * h / w, nRange * h / w, -nRange, nRange);
    else glOrtho(-nRange * w / h, nRange * w / h, -nRange, nRange, -nRange, nRange);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void renderScene() {
    const int points = 16;
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    glColor3f(0.8f, 0.9f, 1.0f);
    glBegin(GL_LINE_STRIP);
    for (int i = 0; i < points; ++i) {
        GLfloat t = static_cast<GLfloat>(i) / (points - 1);
        GLfloat a = t * 2.0f * kPi;
        glVertex3f(45.0f * cosf(a), 45.0f * sinf(a), -55.0f + 110.0f * t);
    }
    glEnd();

    glColor3f(1.0f, 0.3f, 0.3f);
    glBegin(GL_LINE_LOOP);
    for (int i = 0; i < points; ++i) {
        GLfloat a = i * 2.0f * kPi / points;
        glVertex3f(28.0f * cosf(a), 28.0f * sinf(a), 0.0f);
    }
    glEnd();
    glutSwapBuffers();
}

void specialKeys(int key, int, int) {
    if (key == GLUT_KEY_UP) xRot -= 5.0f;
    if (key == GLUT_KEY_DOWN) xRot += 5.0f;
    if (key == GLUT_KEY_LEFT) yRot -= 5.0f;
    if (key == GLUT_KEY_RIGHT) yRot += 5.0f;
    glutPostRedisplay();
}

void setupRC() {
    glClearColor(0.05f, 0.05f, 0.08f, 1.0f);
    glEnable(GL_DEPTH_TEST);
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 5 - LINE_STRIP and LINE_LOOP");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
