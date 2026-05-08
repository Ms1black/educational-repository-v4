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

float g_rotY = 18.0f;

void DrawCar() {
    glColor3f(0.82f, 0.18f, 0.2f);
    glPushMatrix();
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glColor3f(0.9f, 0.47f, 0.2f);
    glPushMatrix();
    glTranslatef(-0.2f, 0.34f, 0.0f);
    glScalef(1.02f, 0.38f, 0.74f);
    glutSolidCube(1.0f);
    glPopMatrix();
}

void SetupSpot(GLenum light, const GLfloat pos[4], const GLfloat dir[3], float cutoff, const GLfloat col[4]) {
    glEnable(light);
    glLightfv(light, GL_POSITION, pos);
    glLightfv(light, GL_SPOT_DIRECTION, dir);
    glLightf(light, GL_SPOT_CUTOFF, cutoff);
    glLightf(light, GL_SPOT_EXPONENT, 16.0f);
    glLightfv(light, GL_DIFFUSE, col);
    glLightfv(light, GL_SPECULAR, col);
    const GLfloat amb[] = {0.04f, 0.04f, 0.04f, 1.0f};
    glLightfv(light, GL_AMBIENT, amb);
}

void ConfigureSpots() {
    const GLfloat p0[] = {2.8f, 3.2f, 2.5f, 1.0f};
    const GLfloat p1[] = {-3.0f, 2.8f, -2.7f, 1.0f};
    const GLfloat p2[] = {-2.7f, -2.3f, 3.1f, 1.0f};

    const GLfloat d0[] = {-1.2f, -1.6f, -1.1f};
    const GLfloat d1[] = {1.3f, -1.1f, 1.2f};
    const GLfloat d2[] = {1.1f, 0.9f, -1.4f};

    const GLfloat c0[] = {0.35f, 0.35f, 0.35f, 1.0f};  // gray tones
    const GLfloat c1[] = {0.58f, 0.58f, 0.58f, 1.0f};
    const GLfloat c2[] = {0.82f, 0.82f, 0.82f, 1.0f};

    SetupSpot(GL_LIGHT0, p0, d0, 20.0f, c0);
    SetupSpot(GL_LIGHT1, p1, d1, 45.0f, c1);
    SetupSpot(GL_LIGHT2, p2, d2, 60.0f, c2);
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(3.5, 2.0, 6.0, 0.0, 0.1, 0.0, 0.0, 1.0, 0.0);

    ConfigureSpots();
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawCar();
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
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    const GLfloat globalAmbient[] = {0.09f, 0.09f, 0.09f, 1.0f};
    const GLfloat matSpec[] = {0.9f, 0.9f, 0.9f, 1.0f};
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbient);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, matSpec);
    glMaterialf(GL_FRONT_AND_BACK, GL_SHININESS, 64.0f);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.06f, 0.07f, 0.1f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #5: Three spotlights (20/45/60)");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
