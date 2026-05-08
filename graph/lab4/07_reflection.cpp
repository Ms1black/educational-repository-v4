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

void DrawCar() {
    glPushMatrix();
    glScalef(1.8f, 0.45f, 0.85f);
    glutSolidCube(1.0f);
    glPopMatrix();

    glPushMatrix();
    glTranslatef(-0.2f, 0.34f, 0.0f);
    glScalef(1.0f, 0.38f, 0.74f);
    glutSolidCube(1.0f);
    glPopMatrix();
}

void DrawFloor(float alpha) {
    glDisable(GL_LIGHTING);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glColor4f(0.15f, 0.24f, 0.35f, alpha);
    glBegin(GL_QUADS);
    glVertex3f(-6.0f, -0.65f, -5.0f);
    glVertex3f(6.0f, -0.65f, -5.0f);
    glVertex3f(6.0f, -0.65f, 5.0f);
    glVertex3f(-6.0f, -0.65f, 5.0f);
    glEnd();
    glDisable(GL_BLEND);
    glEnable(GL_LIGHTING);
}

void DrawScene(bool mirrored) {
    glPushMatrix();
    if (mirrored) glScalef(1.0f, -1.0f, 1.0f);
    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    glColor3f(0.8f, 0.16f, 0.2f);
    DrawCar();
    glPopMatrix();
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(3.8, 2.2, 6.2, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    const GLfloat lightPos[] = {2.7f, 3.6f, 2.5f, 1.0f};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    // Fill stencil where floor exists.
    glDisable(GL_LIGHTING);
    glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);
    glEnable(GL_STENCIL_TEST);
    glStencilFunc(GL_ALWAYS, 1, 0xFF);
    glStencilOp(GL_REPLACE, GL_REPLACE, GL_REPLACE);
    DrawFloor(1.0f);

    // Draw reflection only where stencil == 1.
    glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);
    glEnable(GL_LIGHTING);
    glStencilFunc(GL_EQUAL, 1, 0xFF);
    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);
    DrawScene(true);
    glDisable(GL_STENCIL_TEST);

    DrawScene(false);
    DrawFloor(0.55f);

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
    const GLfloat lightAmb[] = {0.07f, 0.07f, 0.07f, 1.0f};
    const GLfloat lightDif[] = {0.9f, 0.9f, 0.9f, 1.0f};
    const GLfloat spec[] = {0.9f, 0.9f, 0.9f, 1.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_NORMALIZE);
    glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightDif);
    glLightfv(GL_LIGHT0, GL_SPECULAR, spec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, spec);
    glMaterialf(GL_FRONT_AND_BACK, GL_SHININESS, 70.0f);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);
    glClearColor(0.08f, 0.1f, 0.14f, 1.0f);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH | GLUT_STENCIL);
    glutInitWindowSize(980, 660);
    glutCreateWindow("Lab4 #7: Reflection by stencil");

    SetupRC();
    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
