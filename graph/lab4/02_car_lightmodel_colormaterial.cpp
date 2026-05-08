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

int g_example = 0;
float g_rotY = 15.0f;

void DrawWheel(float x, float z) {
    glPushMatrix();
    glTranslatef(x, -0.34f, z);
    glScalef(0.28f, 0.28f, 0.12f);
    glutSolidTorus(0.34, 1.0, 16, 28);
    glPopMatrix();
}

void DrawCarModel() {
    glPushMatrix();
    glColor3f(0.8f, 0.15f, 0.15f);
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glPushMatrix();
    glTranslatef(-0.2f, 0.35f, 0.0f);
    glColor3f(0.92f, 0.5f, 0.24f);
    glScalef(1.0f, 0.4f, 0.75f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glColor3f(0.06f, 0.06f, 0.06f);
    DrawWheel(-0.58f, -0.5f);
    DrawWheel(0.58f, -0.5f);
    DrawWheel(-0.58f, 0.5f);
    DrawWheel(0.58f, 0.5f);
}

void ApplyExample() {
    const GLfloat localViewerTrue[] = {1.0f};
    const GLfloat localViewerFalse[] = {0.0f};
    const GLfloat twoSideTrue[] = {1.0f};
    const GLfloat twoSideFalse[] = {0.0f};
    const GLfloat globalAmbientWarm[] = {0.35f, 0.28f, 0.2f, 1.0f};
    const GLfloat globalAmbientCold[] = {0.08f, 0.12f, 0.25f, 1.0f};
    const GLfloat globalAmbientNeutral[] = {0.2f, 0.2f, 0.2f, 1.0f};

    glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, localViewerFalse);
    glLightModelfv(GL_LIGHT_MODEL_TWO_SIDE, twoSideFalse);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientNeutral);
    glDisable(GL_COLOR_MATERIAL);

    switch (g_example) {
        case 0:
            glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientNeutral);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT, GL_AMBIENT_AND_DIFFUSE);
            break;
        case 1:
            glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientWarm);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT, GL_DIFFUSE);
            break;
        case 2:
            glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientCold);
            glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, localViewerTrue);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT, GL_SPECULAR);
            break;
        case 3:
            glLightModelfv(GL_LIGHT_MODEL_TWO_SIDE, twoSideTrue);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
            break;
        case 4:
            glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, localViewerTrue);
            glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientWarm);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT_AND_BACK, GL_EMISSION);
            break;
        case 5:
            glLightModelfv(GL_LIGHT_MODEL_TWO_SIDE, twoSideTrue);
            glLightModelfv(GL_LIGHT_MODEL_LOCAL_VIEWER, localViewerTrue);
            glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbientCold);
            glEnable(GL_COLOR_MATERIAL);
            glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT);
            break;
    }
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(3.0, 2.2, 5.5, 0.0, 0.1, 0.0, 0.0, 1.0, 0.0);

    const GLfloat lightPos[] = {2.5f, 3.2f, 3.5f, 1.0f};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    ApplyExample();
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawCarModel();
    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 50.0);
}

void SetupRC() {
    const GLfloat lightAmb[] = {0.15f, 0.15f, 0.15f, 1.0f};
    const GLfloat lightDif[] = {0.9f, 0.9f, 0.9f, 1.0f};
    const GLfloat spec[] = {1.0f, 1.0f, 1.0f, 1.0f};
    const GLfloat shininess[] = {70.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightDif);
    glLightfv(GL_LIGHT0, GL_SPECULAR, spec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, spec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, shininess);
    glClearColor(0.08f, 0.09f, 0.12f, 1.0f);
}

void Keyboard(unsigned char key, int, int) {
    if (key >= '1' && key <= '6') g_example = key - '1';
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void Menu(int value) {
    if (value >= 0 && value <= 5) g_example = value;
    if (value == 99) std::exit(0);
    glutPostRedisplay();
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #2: glLightModelfv + glColorMaterial (1..6)");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);

    glutCreateMenu(Menu);
    glutAddMenuEntry("Example 1: neutral ambient + ambient&diffuse", 0);
    glutAddMenuEntry("Example 2: warm ambient + diffuse", 1);
    glutAddMenuEntry("Example 3: local viewer + specular", 2);
    glutAddMenuEntry("Example 4: two side lighting", 3);
    glutAddMenuEntry("Example 5: emission mode", 4);
    glutAddMenuEntry("Example 6: ambient only + two side + local", 5);
    glutAddMenuEntry("Exit", 99);
    glutAttachMenu(GLUT_RIGHT_BUTTON);

    glutMainLoop();
    return 0;
}
