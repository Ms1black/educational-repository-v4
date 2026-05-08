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

bool g_lightOn[4] = {true, true, true, true};
float g_rotY = 20.0f;

void DrawWheel(float x, float z) {
    glPushMatrix();
    glTranslatef(x, -0.35f, z);
    glScalef(0.28f, 0.28f, 0.12f);
    glutSolidTorus(0.34, 1.0, 16, 28);
    glPopMatrix();
}

void DrawCar() {
    glColor3f(0.78f, 0.15f, 0.18f);
    glPushMatrix();
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glColor3f(0.9f, 0.48f, 0.2f);
    glPushMatrix();
    glTranslatef(-0.2f, 0.34f, 0.0f);
    glScalef(1.0f, 0.38f, 0.74f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glColor3f(0.08f, 0.08f, 0.08f);
    DrawWheel(-0.58f, -0.5f);
    DrawWheel(0.58f, -0.5f);
    DrawWheel(-0.58f, 0.5f);
    DrawWheel(0.58f, 0.5f);
}

void ConfigureLights() {
    const GLfloat color[] = {0.95f, 0.93f, 0.86f, 1.0f};
    const GLfloat ambient[] = {0.08f, 0.08f, 0.08f, 1.0f};

    const GLfloat pos0[] = {2.0f, 2.6f, 2.0f, 1.0f};   // close pair
    const GLfloat pos1[] = {2.4f, 2.3f, 1.7f, 1.0f};   // close pair
    const GLfloat pos2[] = {-3.1f, -2.1f, -2.6f, 1.0f};  // opposite octant
    const GLfloat pos3[] = {3.0f, -2.4f, -3.0f, 1.0f};   // opposite octant

    const GLenum lights[4] = {GL_LIGHT0, GL_LIGHT1, GL_LIGHT2, GL_LIGHT3};
    const GLfloat* positions[4] = {pos0, pos1, pos2, pos3};

    for (int i = 0; i < 4; ++i) {
        if (g_lightOn[i]) glEnable(lights[i]);
        else glDisable(lights[i]);
        glLightfv(lights[i], GL_POSITION, positions[i]);
        glLightfv(lights[i], GL_DIFFUSE, color);
        glLightfv(lights[i], GL_SPECULAR, color);
        glLightfv(lights[i], GL_AMBIENT, ambient);
    }
}

void DrawLightMarkers() {
    const GLfloat markers[4][3] = {
        {2.0f, 2.6f, 2.0f}, {2.4f, 2.3f, 1.7f}, {-3.1f, -2.1f, -2.6f}, {3.0f, -2.4f, -3.0f},
    };
    glDisable(GL_LIGHTING);
    glPointSize(9.0f);
    glBegin(GL_POINTS);
    for (int i = 0; i < 4; ++i) {
        glColor3f(g_lightOn[i] ? 1.0f : 0.35f, g_lightOn[i] ? 0.95f : 0.35f, 0.1f);
        glVertex3fv(markers[i]);
    }
    glEnd();
    glEnable(GL_LIGHTING);
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(3.5, 2.2, 6.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    ConfigureLights();
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawCar();
    DrawLightMarkers();
    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 50.0);
}

void ToggleLight(int idx) {
    g_lightOn[idx] = !g_lightOn[idx];
    glutPostRedisplay();
}

void Keyboard(unsigned char key, int, int) {
    if (key == '1') ToggleLight(0);
    if (key == '2') ToggleLight(1);
    if (key == '3') ToggleLight(2);
    if (key == '4') ToggleLight(3);
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void Menu(int value) {
    if (value >= 0 && value <= 3) ToggleLight(value);
    if (value == 90) {
        for (int i = 0; i < 4; ++i) g_lightOn[i] = true;
    }
    if (value == 99) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    const GLfloat globalAmbient[] = {0.12f, 0.12f, 0.12f, 1.0f};
    const GLfloat matSpec[] = {1.0f, 1.0f, 1.0f, 1.0f};
    const GLfloat matShininess[] = {68.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbient);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, matSpec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, matShininess);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.06f, 0.07f, 0.11f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #3: Four lights, one color");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);

    glutCreateMenu(Menu);
    glutAddMenuEntry("Toggle light 1", 0);
    glutAddMenuEntry("Toggle light 2", 1);
    glutAddMenuEntry("Toggle light 3", 2);
    glutAddMenuEntry("Toggle light 4", 3);
    glutAddMenuEntry("Enable all", 90);
    glutAddMenuEntry("Exit", 99);
    glutAttachMenu(GLUT_RIGHT_BUTTON);

    glutMainLoop();
    return 0;
}
