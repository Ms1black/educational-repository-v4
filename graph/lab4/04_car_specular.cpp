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

float g_rotY = 20.0f;
float g_shininess = 20.0f;
bool g_highlight = true;

void DrawCarBody() {
    glPushMatrix();
    glScalef(1.9f, 0.45f, 0.86f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glPushMatrix();
    glTranslatef(-0.15f, 0.35f, 0.0f);
    glScalef(1.05f, 0.38f, 0.75f);
    glutSolidCube(1.0f);
    glPopMatrix();
}

void DrawScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(3.0, 2.0, 5.6, 0.0, 0.1, 0.0, 0.0, 1.0, 0.0);

    const GLfloat lightPos[] = {2.4f, 3.4f, 3.2f, 1.0f};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    const GLfloat specOn[] = {1.0f, 1.0f, 1.0f, 1.0f};
    const GLfloat specOff[] = {0.0f, 0.0f, 0.0f, 1.0f};
    const GLfloat matSpec[] = {0.95f, 0.95f, 0.95f, 1.0f};
    glLightfv(GL_LIGHT0, GL_SPECULAR, g_highlight ? specOn : specOff);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, g_highlight ? matSpec : specOff);
    glMaterialf(GL_FRONT_AND_BACK, GL_SHININESS, g_shininess);

    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    glColor3f(0.78f, 0.1f, 0.15f);
    DrawCarBody();

    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 50.0);
}

void Keyboard(unsigned char key, int, int) {
    if (key == '+' && g_shininess < 128.0f) g_shininess += 4.0f;
    if (key == '-' && g_shininess > 0.0f) g_shininess -= 4.0f;
    if (key == 'h' || key == 'H') g_highlight = !g_highlight;
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    const GLfloat lightAmb[] = {0.08f, 0.08f, 0.08f, 1.0f};
    const GLfloat lightDif[] = {0.9f, 0.9f, 0.9f, 1.0f};
    const GLfloat globalAmbient[] = {0.16f, 0.16f, 0.16f, 1.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightDif);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbient);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.07f, 0.08f, 0.12f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #4: Specular highlights (+/-/H)");

    SetupRC();
    glutDisplayFunc(DrawScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
