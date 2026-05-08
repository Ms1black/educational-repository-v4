#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#include <GLUT/glut.h>
#else
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#endif

#include <cstdlib>

bool g_smoothPoints = true;
bool g_smoothLines = true;
bool g_smoothPolygons = true;
bool g_blend = true;

void DrawDemo() {
    glClear(GL_COLOR_BUFFER_BIT);

    if (g_blend) glEnable(GL_BLEND);
    else glDisable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    if (g_smoothPoints) glEnable(GL_POINT_SMOOTH);
    else glDisable(GL_POINT_SMOOTH);
    if (g_smoothLines) glEnable(GL_LINE_SMOOTH);
    else glDisable(GL_LINE_SMOOTH);
    if (g_smoothPolygons) glEnable(GL_POLYGON_SMOOTH);
    else glDisable(GL_POLYGON_SMOOTH);

    glHint(GL_POINT_SMOOTH_HINT, GL_NICEST);
    glHint(GL_LINE_SMOOTH_HINT, GL_NICEST);
    glHint(GL_POLYGON_SMOOTH_HINT, GL_NICEST);

    glPointSize(22.0f);
    glBegin(GL_POINTS);
    glColor4f(0.95f, 0.25f, 0.2f, 0.85f);
    glVertex2f(-0.75f, 0.65f);
    glColor4f(0.2f, 0.7f, 0.95f, 0.85f);
    glVertex2f(-0.55f, 0.5f);
    glEnd();

    glLineWidth(12.0f);
    glBegin(GL_LINE_STRIP);
    glColor4f(0.95f, 0.9f, 0.2f, 0.75f);
    glVertex2f(-0.25f, 0.7f);
    glVertex2f(0.05f, 0.45f);
    glVertex2f(0.25f, 0.7f);
    glEnd();

    glBegin(GL_POLYGON);
    glColor4f(0.2f, 0.9f, 0.45f, 0.55f);
    glVertex2f(-0.15f, -0.05f);
    glVertex2f(0.45f, -0.12f);
    glVertex2f(0.3f, -0.62f);
    glVertex2f(-0.25f, -0.45f);
    glEnd();

    glBegin(GL_TRIANGLES);
    glColor4f(0.9f, 0.2f, 0.85f, 0.5f);
    glVertex2f(-0.8f, -0.15f);
    glVertex2f(-0.25f, -0.25f);
    glVertex2f(-0.45f, -0.8f);
    glEnd();

    glutSwapBuffers();
}

void Keyboard(unsigned char key, int, int) {
    if (key == '1') g_smoothPoints = !g_smoothPoints;
    if (key == '2') g_smoothLines = !g_smoothLines;
    if (key == '3') g_smoothPolygons = !g_smoothPolygons;
    if (key == 'b' || key == 'B') g_blend = !g_blend;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    glClearColor(0.07f, 0.08f, 0.11f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(960, 640);
    glutCreateWindow("Lab4 #9: Smoothing demo (1/2/3/B)");

    SetupRC();
    glutDisplayFunc(DrawDemo);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
