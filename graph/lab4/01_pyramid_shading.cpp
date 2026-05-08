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

#include <cmath>
#include <cstdlib>

float g_rotY = 25.0f;
bool g_smooth = true;

void DrawPyramid() {
    const GLfloat top[3] = {0.0f, 1.2f, 0.0f};
    const GLfloat base[4][3] = {
        {-1.0f, 0.0f, -1.0f},
        {1.0f, 0.0f, -1.0f},
        {1.0f, 0.0f, 1.0f},
        {-1.0f, 0.0f, 1.0f},
    };

    glBegin(GL_TRIANGLES);
    for (int i = 0; i < 4; ++i) {
        const int j = (i + 1) % 4;
        const float ux = base[i][0] - top[0];
        const float uy = base[i][1] - top[1];
        const float uz = base[i][2] - top[2];
        const float vx = base[j][0] - top[0];
        const float vy = base[j][1] - top[1];
        const float vz = base[j][2] - top[2];
        float nx = uy * vz - uz * vy;
        float ny = uz * vx - ux * vz;
        float nz = ux * vy - uy * vx;
        const float len = std::sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len;
        ny /= len;
        nz /= len;

        glNormal3f(nx, ny, nz);
        glColor3f(0.9f, 0.7f, 0.2f);
        glVertex3fv(top);
        glColor3f(0.85f, 0.25f, 0.2f);
        glVertex3fv(base[i]);
        glColor3f(0.2f, 0.55f, 0.9f);
        glVertex3fv(base[j]);
    }
    glEnd();

    glNormal3f(0.0f, -1.0f, 0.0f);
    glColor3f(0.3f, 0.8f, 0.35f);
    glBegin(GL_QUADS);
    for (int i = 3; i >= 0; --i) {
        glVertex3fv(base[i]);
    }
    glEnd();
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(2.4, 2.0, 3.8, 0.0, 0.4, 0.0, 0.0, 1.0, 0.0);

    glRotatef(g_rotY, 0.0f, 1.0f, 0.0f);
    DrawPyramid();

    glutSwapBuffers();
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, static_cast<double>(w) / static_cast<double>(h), 0.1, 50.0);
}

void SetupLighting() {
    const GLfloat lightPos[] = {2.0f, 3.0f, 2.0f, 1.0f};
    const GLfloat lightAmb[] = {0.18f, 0.18f, 0.18f, 1.0f};
    const GLfloat lightDif[] = {0.92f, 0.92f, 0.92f, 1.0f};
    const GLfloat matSpec[] = {0.35f, 0.35f, 0.35f, 1.0f};
    const GLfloat matShine[] = {20.0f};

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);

    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
    glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightDif);
    glLightfv(GL_LIGHT0, GL_SPECULAR, lightDif);

    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, matSpec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, matShine);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);

    glClearColor(0.07f, 0.08f, 0.12f, 1.0f);
}

void ToggleShading() {
    g_smooth = !g_smooth;
    glShadeModel(g_smooth ? GL_SMOOTH : GL_FLAT);
    glutPostRedisplay();
}

void Keyboard(unsigned char key, int, int) {
    if (key == 's' || key == 'S') ToggleShading();
    if (key == 'a' || key == 'A') g_rotY -= 5.0f;
    if (key == 'd' || key == 'D') g_rotY += 5.0f;
    if (key == 27) std::exit(0);
    glutPostRedisplay();
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(960, 640);
    glutCreateWindow("Lab4 #1: Pyramid shading (S - smooth/flat)");

    SetupLighting();
    glShadeModel(GL_SMOOTH);

    glutDisplayFunc(RenderScene);
    glutReshapeFunc(ChangeSize);
    glutKeyboardFunc(Keyboard);
    glutMainLoop();
    return 0;
}
