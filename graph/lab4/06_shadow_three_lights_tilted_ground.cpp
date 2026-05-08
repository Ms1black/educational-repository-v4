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

void BuildShadowMatrix(GLfloat m[16], const GLfloat plane[4], const GLfloat light[4]) {
    const GLfloat dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];
    m[0] = dot - light[0] * plane[0];
    m[4] = 0.0f - light[0] * plane[1];
    m[8] = 0.0f - light[0] * plane[2];
    m[12] = 0.0f - light[0] * plane[3];

    m[1] = 0.0f - light[1] * plane[0];
    m[5] = dot - light[1] * plane[1];
    m[9] = 0.0f - light[1] * plane[2];
    m[13] = 0.0f - light[1] * plane[3];

    m[2] = 0.0f - light[2] * plane[0];
    m[6] = 0.0f - light[2] * plane[1];
    m[10] = dot - light[2] * plane[2];
    m[14] = 0.0f - light[2] * plane[3];

    m[3] = 0.0f - light[3] * plane[0];
    m[7] = 0.0f - light[3] * plane[1];
    m[11] = 0.0f - light[3] * plane[2];
    m[15] = dot - light[3] * plane[3];
}

void DrawCar() {
    glPushMatrix();
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glPushMatrix();
    glTranslatef(-0.2f, 0.35f, 0.0f);
    glScalef(1.0f, 0.38f, 0.74f);
    glutSolidCube(1.0f);
    glPopMatrix();
}

void DrawGround() {
    glColor3f(0.25f, 0.34f, 0.25f);
    glBegin(GL_QUADS);
    glVertex3f(-6.0f, -1.2f, -4.5f);
    glVertex3f(6.0f, -0.4f, -4.5f);
    glVertex3f(6.0f, 0.2f, 4.5f);
    glVertex3f(-6.0f, -0.6f, 4.5f);
    glEnd();
}

void SetupLights() {
    const GLfloat l0[] = {2.2f, 3.0f, 2.0f, 1.0f};
    const GLfloat l1[] = {-2.8f, 2.7f, 2.6f, 1.0f};
    const GLfloat l2[] = {2.4f, 3.2f, -2.9f, 1.0f};
    const GLfloat col[] = {0.88f, 0.88f, 0.88f, 1.0f};
    const GLfloat amb[] = {0.06f, 0.06f, 0.06f, 1.0f};

    const GLenum lights[] = {GL_LIGHT0, GL_LIGHT1, GL_LIGHT2};
    const GLfloat* positions[] = {l0, l1, l2};
    for (int i = 0; i < 3; ++i) {
        glEnable(lights[i]);
        glLightfv(lights[i], GL_POSITION, positions[i]);
        glLightfv(lights[i], GL_DIFFUSE, col);
        glLightfv(lights[i], GL_SPECULAR, col);
        glLightfv(lights[i], GL_AMBIENT, amb);
    }
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(4.4, 2.2, 6.0, 0.0, -0.1, 0.0, 0.0, 1.0, 0.0);

    SetupLights();

    DrawGround();

    glPushMatrix();
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    glColor3f(0.83f, 0.16f, 0.18f);
    DrawCar();
    glPopMatrix();

    // Shadow projection to the inclined plane: 0*x -108*y + 72*z - 97.2 = 0
    const GLfloat plane[] = {0.0f, -108.0f, 72.0f, -97.2f};
    const GLfloat shadowLight[] = {2.2f, 3.0f, 2.0f, 1.0f};
    GLfloat shadowMatrix[16];
    BuildShadowMatrix(shadowMatrix, plane, shadowLight);

    glDisable(GL_LIGHTING);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glColor4f(0.02f, 0.02f, 0.02f, 0.62f);

    glPushMatrix();
    glMultMatrixf(shadowMatrix);
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawCar();
    glPopMatrix();

    glDisable(GL_BLEND);
    glEnable(GL_LIGHTING);
    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 60.0);
}

void Keyboard(unsigned char key, int, int) {
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

void SetupRC() {
    const GLfloat globalAmbient[] = {0.13f, 0.13f, 0.13f, 1.0f};
    const GLfloat matSpec[] = {0.92f, 0.92f, 0.92f, 1.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_NORMALIZE);
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmbient);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, matSpec);
    glMaterialf(GL_FRONT_AND_BACK, GL_SHININESS, 48.0f);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.09f, 0.1f, 0.14f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #6: Planar shadow + 3 lights + tilted ground");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
