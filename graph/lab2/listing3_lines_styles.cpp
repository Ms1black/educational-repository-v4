#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <GL/glew.h>
#include <GLUT/glut.h>
#else
#include "glew.h"
#include "glut.h"
#endif

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

    glEnable(GL_LINE_STIPPLE);
    for (int i = 0; i < 10; ++i) {
        GLfloat y = -85.0f + i * 17.0f;
        GLfloat width = 1.0f + 0.6f * i;
        glLineWidth(width);
        glLineStipple(1 + i % 4, (i % 2 == 0) ? 0x00FF : 0x1C47);
        glColor3f((i % 3) / 2.0f, ((i + 1) % 3) / 2.0f, ((i + 2) % 3) / 2.0f);
        glBegin(GL_LINES);
        glVertex3f(-80.0f, y, -30.0f + i * 6.0f);
        glVertex3f(80.0f, y, 30.0f - i * 6.0f);
        glEnd();
    }
    glDisable(GL_LINE_STIPPLE);
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
    glutCreateWindow("Listing 3 - Lines styles");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutMainLoop();
    return 0;
}
