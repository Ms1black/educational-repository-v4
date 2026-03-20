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
static GLfloat yRot = -30.0f;
static bool depthTest = true;
static bool cullFace = false;

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

void drawCone() {
    glBegin(GL_TRIANGLES);
    glColor3f(0.1f, 0.8f, 0.4f);
    glVertex3f(0.0f, 55.0f, 0.0f);
    glVertex3f(-40.0f, -20.0f, 40.0f);
    glVertex3f(40.0f, -20.0f, 40.0f);

    glColor3f(0.2f, 0.5f, 1.0f);
    glVertex3f(0.0f, 55.0f, 0.0f);
    glVertex3f(40.0f, -20.0f, 40.0f);
    glVertex3f(40.0f, -20.0f, -40.0f);

    glColor3f(1.0f, 0.2f, 0.5f);
    glVertex3f(0.0f, 55.0f, 0.0f);
    glVertex3f(40.0f, -20.0f, -40.0f);
    glVertex3f(-40.0f, -20.0f, -40.0f);

    glColor3f(1.0f, 0.7f, 0.2f);
    glVertex3f(0.0f, 55.0f, 0.0f);
    glVertex3f(-40.0f, -20.0f, -40.0f);
    glVertex3f(-40.0f, -20.0f, 40.0f);
    glEnd();

    glBegin(GL_TRIANGLE_FAN);
    glColor3f(0.6f, 0.6f, 0.6f);
    glVertex3f(0.0f, -20.0f, 0.0f);
    for (int i = 0; i <= 16; ++i) {
        GLfloat a = i * 2.0f * kPi / 16.0f;
        glVertex3f(40.0f * cosf(a), -20.0f, 40.0f * sinf(a));
    }
    glEnd();
}

void renderScene() {
    if (depthTest) glEnable(GL_DEPTH_TEST);
    else glDisable(GL_DEPTH_TEST);

    if (cullFace) {
        glEnable(GL_CULL_FACE);
        glCullFace(GL_BACK);
        glFrontFace(GL_CCW);
    } else {
        glDisable(GL_CULL_FACE);
    }

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);
    drawCone();
    glutSwapBuffers();
}

void keyboard(unsigned char key, int, int) {
    if (key == 'd' || key == 'D') depthTest = !depthTest;
    if (key == 'c' || key == 'C') cullFace = !cullFace;
    glutPostRedisplay();
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
    glutCreateWindow("Listing 9 - Depth/Cull (D,C toggle)");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutKeyboardFunc(keyboard);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
