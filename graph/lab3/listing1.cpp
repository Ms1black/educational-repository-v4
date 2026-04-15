#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <OpenGL/gl.h>
#include <GLUT/glut.h>
#else
#include <GL/glut.h>
#endif

#include <cmath>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static GLfloat xRot = 0.0f;
static GLfloat yRot = 0.0f;

static void drawElectronRGB(float r, float g, float b) {
    glColor3f(r, g, b);
    glutSolidSphere(6.0f, 15, 15);
}

void RenderScene(void) {
    static float t = 0.0f;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);

    glTranslatef(0.0f, 0.0f, -100.0f);

    glColor3ub(255, 0, 0);
    glutSolidSphere(10.0f, 15, 15);

    glPushMatrix();
    glTranslatef(88.0f * cosf(t), 0.0f, 50.0f * sinf(t));
    drawElectronRGB(1.0f, 1.0f, 0.0f);
    glPopMatrix();
    glPushMatrix();
    glTranslatef(88.0f * cosf(t + (float)M_PI), 0.0f, 50.0f * sinf(t + (float)M_PI));
    drawElectronRGB(0.0f, 0.86f, 1.0f);
    glPopMatrix();

    glPushMatrix();
    glRotatef(45.0f, 0.0f, 0.0f, 1.0f);
    glTranslatef(-66.0f * cosf(t), -38.0f * sinf(t), 0.0f);
    drawElectronRGB(1.0f, 1.0f, 0.0f);
    glPopMatrix();
    glPushMatrix();
    glRotatef(45.0f, 0.0f, 0.0f, 1.0f);
    glTranslatef(-66.0f * cosf(t + (float)M_PI), -38.0f * sinf(t + (float)M_PI), 0.0f);
    drawElectronRGB(1.0f, 0.5f, 0.0f);
    glPopMatrix();

    glPushMatrix();
    glRotatef(360.0f - 45.0f, 0.0f, 0.0f, 1.0f);
    glTranslatef(36.0f * sinf(t), 42.0f * sinf(2.0f * t), 56.0f * cosf(t));
    drawElectronRGB(1.0f, 1.0f, 0.0f);
    glPopMatrix();
    glPushMatrix();
    glRotatef(360.0f - 45.0f, 0.0f, 0.0f, 1.0f);
    glTranslatef(36.0f * sinf(t + (float)M_PI), 42.0f * sinf(2.0f * (t + (float)M_PI)),
                 56.0f * cosf(t + (float)M_PI));
    drawElectronRGB(0.7f, 0.0f, 1.0f);
    glPopMatrix();

    t += 0.11f;
    if (t > (float)(2.0 * M_PI))
        t -= (float)(2.0 * M_PI);

    glutSwapBuffers();
}

void SetupRC() {
    glEnable(GL_DEPTH_TEST);
    glFrontFace(GL_CCW);
    glEnable(GL_CULL_FACE);
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
}

void SpecialKeys(int key, int, int) {
    if (key == GLUT_KEY_UP)
        xRot -= 5.0f;
    if (key == GLUT_KEY_DOWN)
        xRot += 5.0f;
    if (key == GLUT_KEY_LEFT)
        yRot -= 5.0f;
    if (key == GLUT_KEY_RIGHT)
        yRot += 5.0f;
    while (xRot < 0.0f)
        xRot += 360.0f;
    while (xRot >= 360.0f)
        xRot -= 360.0f;
    while (yRot < 0.0f)
        yRot += 360.0f;
    while (yRot >= 360.0f)
        yRot -= 360.0f;
    glutPostRedisplay();
}

void TimerFunc(int) {
    glutPostRedisplay();
    glutTimerFunc(33, TimerFunc, 1);
}

void ChangeSize(int w, int h) {
    GLfloat nRange = 100.0f;
    if (h == 0)
        h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    if (w <= h)
        glOrtho(-nRange, nRange, -nRange * h / w, nRange * h / w, -nRange * 2.0f, nRange * 2.0f);
    else
        glOrtho(-nRange * w / h, nRange * w / h, -nRange, nRange, -nRange * 2.0f, nRange * 2.0f);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 1 - Atom");
    glutReshapeFunc(ChangeSize);
    glutSpecialFunc(SpecialKeys);
    glutDisplayFunc(RenderScene);
    glutTimerFunc(33, TimerFunc, 1);
    SetupRC();
    glutMainLoop();
    return 0;
}
