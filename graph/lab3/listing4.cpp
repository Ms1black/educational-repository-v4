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
#include <cstring>

#define GLT_PI 3.14159265358979323846
#define GLT_PI_DIV_180 0.017453292519943296
#define gltDegToRad(x) ((x) * GLT_PI_DIV_180)

typedef GLfloat GLTVector3[3];
typedef GLfloat GLTMatrix[16];

void gltLoadIdentityMatrix(GLTMatrix m) {
    static GLTMatrix identity = {1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f,
                                 0.0f, 0.0f, 0.0f, 0.0f, 1.0f};
    memcpy(m, identity, sizeof(GLTMatrix));
}

void gltTransformPoint(const GLTVector3 vSrcVector, const GLTMatrix mMatrix, GLTVector3 vOut) {
    vOut[0] = mMatrix[0] * vSrcVector[0] + mMatrix[4] * vSrcVector[1] + mMatrix[8] * vSrcVector[2] +
              mMatrix[12];
    vOut[1] = mMatrix[1] * vSrcVector[0] + mMatrix[5] * vSrcVector[1] + mMatrix[9] * vSrcVector[2] +
              mMatrix[13];
    vOut[2] = mMatrix[2] * vSrcVector[0] + mMatrix[6] * vSrcVector[1] + mMatrix[10] * vSrcVector[2] +
              mMatrix[14];
}

void gltRotationMatrix(float angle, float x, float y, float z, GLTMatrix mMatrix) {
    float vecLength, sinSave, cosSave, oneMinusCos;
    float xx, yy, zz, xy, yz, zx, xs, ys, zs;
    if (x == 0.0f && y == 0.0f && z == 0.0f) {
        gltLoadIdentityMatrix(mMatrix);
        return;
    }
    vecLength = (float)sqrt(x * x + y * y + z * z);
    x /= vecLength;
    y /= vecLength;
    z /= vecLength;
    sinSave = (float)sin(angle);
    cosSave = (float)cos(angle);
    oneMinusCos = 1.0f - cosSave;
    xx = x * x;
    yy = y * y;
    zz = z * z;
    xy = x * y;
    yz = y * z;
    zx = z * x;
    xs = x * sinSave;
    ys = y * sinSave;
    zs = z * sinSave;
    mMatrix[0] = (oneMinusCos * xx) + cosSave;
    mMatrix[4] = (oneMinusCos * xy) - zs;
    mMatrix[8] = (oneMinusCos * zx) + ys;
    mMatrix[12] = 0.0f;
    mMatrix[1] = (oneMinusCos * xy) + zs;
    mMatrix[5] = (oneMinusCos * yy) + cosSave;
    mMatrix[9] = (oneMinusCos * yz) - xs;
    mMatrix[13] = 0.0f;
    mMatrix[2] = (oneMinusCos * zx) - ys;
    mMatrix[6] = (oneMinusCos * yz) + xs;
    mMatrix[10] = (oneMinusCos * zz) + cosSave;
    mMatrix[14] = 0.0f;
    mMatrix[3] = 0.0f;
    mMatrix[7] = 0.0f;
    mMatrix[11] = 0.0f;
    mMatrix[15] = 1.0f;
}

void DrawTorus(GLTMatrix mTransform) {
    GLfloat majorRadius = 0.35f;
    GLfloat minorRadius = 0.15f;
    GLint numMajor = 40;
    GLint numMinor = 20;
    GLTVector3 objectVertex;
    GLTVector3 transformedVertex;
    double majorStep = 2.0f * GLT_PI / numMajor;
    double minorStep = 2.0f * GLT_PI / numMinor;
    int i, j;
    for (i = 0; i < numMajor; ++i) {
        double a0 = i * majorStep;
        double a1 = a0 + majorStep;
        GLfloat x0 = (GLfloat)cos(a0);
        GLfloat y0 = (GLfloat)sin(a0);
        GLfloat x1 = (GLfloat)cos(a1);
        GLfloat y1 = (GLfloat)sin(a1);
        glBegin(GL_TRIANGLE_STRIP);
        for (j = 0; j <= numMinor; ++j) {
            double b = j * minorStep;
            GLfloat c = (GLfloat)cos(b);
            GLfloat r = minorRadius * c + majorRadius;
            GLfloat z = minorRadius * (GLfloat)sin(b);
            objectVertex[0] = x0 * r;
            objectVertex[1] = y0 * r;
            objectVertex[2] = z;
            gltTransformPoint(objectVertex, mTransform, transformedVertex);
            glVertex3fv(transformedVertex);
            objectVertex[0] = x1 * r;
            objectVertex[1] = y1 * r;
            objectVertex[2] = z;
            gltTransformPoint(objectVertex, mTransform, transformedVertex);
            glVertex3fv(transformedVertex);
        }
        glEnd();
    }
}

void RenderScene(void) {
    GLTMatrix transformationMatrix;
    static GLfloat yRot = 0.0f;
    yRot -= 0.5f;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    gltRotationMatrix(gltDegToRad(yRot), 0.0f, 1.0f, 0.0f, transformationMatrix);
    transformationMatrix[12] = 0.0f;
    transformationMatrix[13] = 0.0f;
    transformationMatrix[14] = -2.5f;

    glColor3f(0.25f, 0.75f, 0.95f);
    DrawTorus(transformationMatrix);

    glutSwapBuffers();
}

void SetupRC() {
    glClearColor(0.05f, 0.08f, 0.12f, 1.0f);
    glEnable(GL_DEPTH_TEST);
    glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
}

void TimerFunction(int value) {
    glutPostRedisplay();
    glutTimerFunc(33, TimerFunction, 1);
}

void ChangeSize(int w, int h) {
    GLfloat fAspect;
    if (h == 0)
        h = 1;
    glViewport(0, 0, w, h);
    fAspect = (GLfloat)w / (GLfloat)h;
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(35.0f, fAspect, 1.0f, 50.0f);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 4 - Torus (p.3)");
    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);
    SetupRC();
    glutTimerFunc(33, TimerFunction, 1);
    glutMainLoop();
    return 0;
}
