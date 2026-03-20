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

void drawApprox(GLfloat step, GLfloat yShift, GLfloat r, GLfloat g, GLfloat b) {
    glColor3f(r, g, b);
    glBegin(GL_LINE_STRIP);
    for (GLfloat t = 0.0f; t <= 2.0f * kPi; t += step) {
        GLfloat x = -85.0f + 170.0f * (t / (2.0f * kPi));
        GLfloat y = yShift + 18.0f * sinf(3.0f * t);
        GLfloat z = 15.0f * cosf(2.0f * t);
        glVertex3f(x, y, z);
    }
    glEnd();
}

void renderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glLineWidth(2.0f);
    drawApprox(0.65f, 35.0f, 1.0f, 0.3f, 0.3f);
    drawApprox(0.30f, 0.0f, 1.0f, 1.0f, 0.2f);
    drawApprox(0.12f, -35.0f, 0.2f, 1.0f, 0.3f);
    glLineWidth(1.0f);
    glutSwapBuffers();
}

void setupRC() {
    glClearColor(0.05f, 0.05f, 0.08f, 1.0f);
    glEnable(GL_DEPTH_TEST);
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 4 - Curve approximation");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutMainLoop();
    return 0;
}
