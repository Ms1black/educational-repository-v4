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

float g_rotY = 22.0f;
int g_fogMode = 0;    // 0 linear, 1 exp, 2 exp2
int g_fogColor = 0;   // 0 blue, 1 gray, 2 warm
float g_density = 0.2f;

void DrawCarAt(float z, float scale, float r, float g, float b) {
    glPushMatrix();
    glTranslatef(0.0f, 0.0f, z);
    glScalef(scale, scale, scale);
    glColor3f(r, g, b);
    glPushMatrix();
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();
    glPushMatrix();
    glTranslatef(-0.2f, 0.34f, 0.0f);
    glScalef(1.0f, 0.38f, 0.74f);
    glutSolidCube(1.0f);
    glPopMatrix();
    glPopMatrix();
}

void ApplyFog() {
    GLfloat fogColBlue[] = {0.05f, 0.09f, 0.18f, 1.0f};
    GLfloat fogColGray[] = {0.42f, 0.43f, 0.46f, 1.0f};
    GLfloat fogColWarm[] = {0.3f, 0.22f, 0.14f, 1.0f};
    GLfloat* current = fogColBlue;
    if (g_fogColor == 1) current = fogColGray;
    if (g_fogColor == 2) current = fogColWarm;

    glEnable(GL_FOG);
    glFogfv(GL_FOG_COLOR, current);
    glClearColor(current[0], current[1], current[2], 1.0f);
    glFogf(GL_FOG_DENSITY, g_density);
    glHint(GL_FOG_HINT, GL_NICEST);

    if (g_fogMode == 0) {
        glFogi(GL_FOG_MODE, GL_LINEAR);
        glFogf(GL_FOG_START, 3.0f);
        glFogf(GL_FOG_END, 15.0f);
    } else if (g_fogMode == 1) {
        glFogi(GL_FOG_MODE, GL_EXP);
    } else {
        glFogi(GL_FOG_MODE, GL_EXP2);
    }
}

void RenderScene() {
    ApplyFog();
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(2.8, 2.0, 6.0, 0.0, 0.0, -4.0, 0.0, 1.0, 0.0);

    const GLfloat lightPos[] = {2.5f, 3.2f, 2.3f, 1.0f};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawCarAt(0.0f, 1.0f, 0.8f, 0.16f, 0.2f);
    DrawCarAt(-3.0f, 0.85f, 0.72f, 0.2f, 0.2f);
    DrawCarAt(-6.0f, 0.7f, 0.62f, 0.26f, 0.2f);
    DrawCarAt(-9.0f, 0.56f, 0.5f, 0.32f, 0.2f);

    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 80.0);
}

void Menu(int value) {
    if (value == 0 || value == 1 || value == 2) g_fogMode = value;
    if (value == 10 || value == 11 || value == 12) g_fogColor = value - 10;
    if (value == 20) g_density = 0.08f;
    if (value == 21) g_density = 0.2f;
    if (value == 22) g_density = 0.35f;
    if (value == 99) std::exit(0);
    glutPostRedisplay();
}

void Keyboard(unsigned char key, int, int) {
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    const GLfloat amb[] = {0.08f, 0.08f, 0.08f, 1.0f};
    const GLfloat dif[] = {0.92f, 0.92f, 0.92f, 1.0f};
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_AMBIENT, amb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, dif);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #8: Fog color/mode/equation menu");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);

    int modeMenu = glutCreateMenu(Menu);
    glutAddMenuEntry("Mode: linear", 0);
    glutAddMenuEntry("Mode: exp", 1);
    glutAddMenuEntry("Mode: exp2", 2);

    int colorMenu = glutCreateMenu(Menu);
    glutAddMenuEntry("Color: blue", 10);
    glutAddMenuEntry("Color: gray", 11);
    glutAddMenuEntry("Color: warm", 12);

    int densityMenu = glutCreateMenu(Menu);
    glutAddMenuEntry("Density: low", 20);
    glutAddMenuEntry("Density: medium", 21);
    glutAddMenuEntry("Density: high", 22);

    glutCreateMenu(Menu);
    glutAddSubMenu("Fog mode/equation", modeMenu);
    glutAddSubMenu("Fog color", colorMenu);
    glutAddSubMenu("Fog density", densityMenu);
    glutAddMenuEntry("Exit", 99);
    glutAttachMenu(GLUT_RIGHT_BUTTON);

    glutMainLoop();
    return 0;
}
