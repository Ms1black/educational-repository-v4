#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <GL/glew.h>
#include <GLUT/glut.h>
#else
#include "glew.h"
#include "glut.h"
#endif

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
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    
    glBegin(GL_TRIANGLES);
    glColor3f(0.9f, 0.2f, 0.2f);
    glVertex3f(0.0f, 45.0f, 0.0f);
    glVertex3f(-30.0f, -20.0f, 30.0f);
    glVertex3f(30.0f, -20.0f, 30.0f);

    glColor3f(0.2f, 0.9f, 0.2f);
    glVertex3f(0.0f, 45.0f, 0.0f);
    glVertex3f(30.0f, -20.0f, 30.0f);
    glVertex3f(30.0f, -20.0f, -30.0f);

    glColor3f(0.2f, 0.2f, 0.9f);
    glVertex3f(0.0f, 45.0f, 0.0f);
    glVertex3f(30.0f, -20.0f, -30.0f);
    glVertex3f(-30.0f, -20.0f, -30.0f);

    glColor3f(0.9f, 0.9f, 0.2f);
    glVertex3f(0.0f, 45.0f, 0.0f);
    glVertex3f(-30.0f, -20.0f, -30.0f);
    glVertex3f(-30.0f, -20.0f, 30.0f);
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
    glutCreateWindow("Listing 6 - Triangles object");
    setupRC();
    glutDisplayFunc(renderScene);
    glutReshapeFunc(changeSize);
    glutSpecialFunc(specialKeys);
    glutMainLoop();
    return 0;
}
