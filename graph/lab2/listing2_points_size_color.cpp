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
static GLfloat yRot = -25.0f;

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
    GLfloat range[2] = {1.0f, 10.0f};
    GLfloat step = 1.0f;
    glGetFloatv(GL_POINT_SIZE_RANGE, range);
    glGetFloatv(GL_POINT_SIZE_GRANULARITY, &step);
    if (step <= 0.0f) step = 1.0f;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    GLfloat size = range[0];
    GLfloat z = -60.0f;
    for (GLfloat a = 0.0f; a <= 6.0f * kPi; a += 0.2f) {
        GLfloat x = 40.0f * sinf(a);
        GLfloat y = 40.0f * cosf(a);
        glPointSize(size);
        glColor3f(0.5f + 0.5f * sinf(a), 0.5f + 0.5f * cosf(a), 0.7f);
        glBegin(GL_POINTS);
        glVertex3f(x, y, z);
        glEnd();
        z += 1.1f;
        size += step;
        if (size > range[1]) size = range[0];
    }
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
    glutCreateWindow("Listing 2 - Points size/color");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
