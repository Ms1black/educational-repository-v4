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
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    glBegin(GL_TRIANGLE_STRIP);
    for (int i = 0; i <= 12; ++i) {
        GLfloat x = -60.0f + i * 10.0f;
        glColor3f(0.3f, 0.9f - i * 0.05f, 0.3f + i * 0.04f);
        glVertex3f(x, -35.0f, -25.0f + i * 3.0f);
        glVertex3f(x, -5.0f, -5.0f + i * 3.0f);
    }
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    glColor3f(1.0f, 0.8f, 0.1f);
    glVertex3f(35.0f, 15.0f, 0.0f);
    for (int i = 0; i <= 16; ++i) {
        GLfloat a = i * 2.0f * kPi / 16.0f;
        glColor3f(1.0f, 0.3f + 0.03f * i, 0.2f);
        glVertex3f(35.0f + 24.0f * cosf(a), 15.0f + 24.0f * sinf(a), 10.0f * sinf(2.0f * a));
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
    glutCreateWindow("Listing 7 - Strip and Fan");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
