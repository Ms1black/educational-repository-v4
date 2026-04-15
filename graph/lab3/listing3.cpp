#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <OpenGL/glu.h>
#include <OpenGL/gl.h>
#include <GLUT/glut.h>
#else
#include <GL/glu.h>
#include <GL/glut.h>
#endif

#include <cmath>

GLfloat whiteLight[] = {0.2f, 0.2f, 0.2f, 1.0f};
GLfloat sourceLight[] = {0.8f, 0.8f, 0.8f, 1.0f};
GLfloat lightPos[] = {0.0f, 0.0f, 0.0f, 1.0f};

void RenderScene(void) {
    static float fEarthRot = 0.0f;
    static float fMoonRot = 0.0f;
    static float fExtraPlanetRot = 180.0f;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glPushMatrix();
    glTranslatef(0.0f, 0.0f, -320.0f);

    glDisable(GL_LIGHTING);
    glColor3ub(255, 255, 0);
    glutSolidSphere(15.0f, 30, 17);
    glEnable(GL_LIGHTING);
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    glRotatef(fEarthRot, 0.0f, 1.0f, 0.0f);
    glPushMatrix();
    glTranslatef(100.0f, 0.0f, 0.0f);
    glColor3ub(40, 80, 220);
    glutSolidSphere(14.0f, 28, 16);

    glPushMatrix();
    glColor3ub(200, 200, 210);
    glRotatef(fMoonRot, 0.0f, 1.0f, 0.0f);
    glTranslatef(28.0f, 0.0f, 0.0f);
    fMoonRot += 15.0f;
    if (fMoonRot > 360.0f) fMoonRot = 0.0f;
    glutSolidSphere(5.5f, 22, 14);
    glPopMatrix();
    glPopMatrix();

    glPushMatrix();
    glColor3ub(255, 130, 40);
    glRotatef(fExtraPlanetRot, 0.0f, 1.0f, 0.0f);
    glTranslatef(148.0f, 0.0f, 0.0f);
    glutSolidSphere(9.5f, 22, 14);
    glPopMatrix();

    fEarthRot += 5.0f;
    if (fEarthRot > 360.0f) fEarthRot = 0.0f;
    fExtraPlanetRot += 3.2f;
    if (fExtraPlanetRot > 360.0f) fExtraPlanetRot = 0.0f;

    glPopMatrix();

    glutSwapBuffers();
}

void SetupRC() {
    glEnable(GL_DEPTH_TEST);
    glFrontFace(GL_CCW);
    glEnable(GL_CULL_FACE);
    glEnable(GL_LIGHTING);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, whiteLight);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, sourceLight);
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
    glEnable(GL_LIGHT0);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.02f, 0.02f, 0.06f, 1.0f);
}

void TimerFunc(int value) {
    glutPostRedisplay();
    glutTimerFunc(33, TimerFunc, 1);
}

void ChangeSize(int w, int h) {
    GLfloat fAspect;
    if (h == 0)
        h = 1;
    glViewport(0, 0, w, h);
    fAspect = (GLfloat)w / (GLfloat)h;
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(45.0f, fAspect, 1.0, 500.0);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 3 - Sun/Earth/Moon + one extra planet (p.3)");
    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);
    glutTimerFunc(33, TimerFunc, 1);
    SetupRC();
    glutMainLoop();
    return 0;
}
