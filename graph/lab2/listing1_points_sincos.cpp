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
static bool greenColor = true;

void changeSize(GLsizei w, GLsizei h) {
    GLfloat nRange = 100.0f;
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    if (w <= h) {
        glOrtho(-nRange, nRange, -nRange * h / w, nRange * h / w, -nRange, nRange);
    } else {
        glOrtho(-nRange * w / h, nRange * w / h, -nRange, nRange, -nRange, nRange);
    }
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void renderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    if (greenColor) glColor3f(0.2f, 1.0f, 0.4f);
    else glColor3f(1.0f, 0.6f, 0.2f);
    glBegin(GL_POINTS);
    GLfloat z = -60.0f;
    for (GLfloat a = 0.0f; a <= 7.0f * kPi; a += 0.2f) {
        GLfloat x = 35.0f * sinf(a);
        GLfloat y = 35.0f * cosf(a);
        glVertex3f(x, y, z);
        z += 1.2f;
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

void menuHandler(int value) {
    if (value == 1) greenColor = true;
    if (value == 2) greenColor = false;
    if (value == 3) {
        xRot = 20.0f;
        yRot = -20.0f;
    }
    glutPostRedisplay();
}

void setupMenu() {
    int menu = glutCreateMenu(menuHandler);
    glutAddMenuEntry("Green points", 1);
    glutAddMenuEntry("Orange points", 2);
    glutAddMenuEntry("Reset rotation", 3);
    glutAttachMenu(GLUT_RIGHT_BUTTON);
}

void setupRC() {
    glClearColor(0.05f, 0.05f, 0.08f, 1.0f);
    glEnable(GL_DEPTH_TEST);
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 1 - Points sin/cos");
    setupRC();
    setupMenu();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
