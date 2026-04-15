#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <OpenGL/gl.h>
#include <GLUT/glut.h>
#else
#include <GL/glut.h>
#endif

void ChangeSize(GLsizei w, GLsizei h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    if (w <= h) glOrtho(-120.0, 120.0, -120.0 * h / w, 120.0 * h / w, -1.0, 1.0);
    else glOrtho(-120.0 * w / h, 120.0 * w / h, -120.0, 120.0, -1.0, 1.0);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT);
    glLoadIdentity();

    glColor3f(0.03f, 0.03f, 0.03f);
    glBegin(GL_POLYGON);
    glVertex2f(-105.0f, 0.0f);
    glVertex2f(-72.0f, 56.0f);
    glVertex2f(72.0f, 56.0f);
    glVertex2f(105.0f, 0.0f);
    glVertex2f(72.0f, -56.0f);
    glVertex2f(-72.0f, -56.0f);
    glEnd();

    glColor3f(0.90f, 0.90f, 0.90f);
    glBegin(GL_POLYGON);
    glVertex2f(-94.0f, 0.0f);
    glVertex2f(-66.0f, 46.0f);
    glVertex2f(66.0f, 46.0f);
    glVertex2f(94.0f, 0.0f);
    glVertex2f(66.0f, -46.0f);
    glVertex2f(-66.0f, -46.0f);
    glEnd();

    glutSwapBuffers();
}

void SetupRC() {
    glClearColor(0.86f, 0.86f, 0.86f, 1.0f);
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(800, 360);
    glutCreateWindow("Listing 2 - Figure from image");
    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);
    SetupRC();
    glutMainLoop();
    return 0;
}
