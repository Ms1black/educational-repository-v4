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
#include <cstdlib>
#include <ctime>

#define GLT_PI 3.14159265358979323846
#define GLT_PI_DIV_180 0.017453292519943296
#define GLT_INV_PI_DIV_180 57.2957795130823229
#define gltDegToRad(x) ((x) * GLT_PI_DIV_180)

typedef GLfloat GLTVector3[3];
typedef GLfloat GLTMatrix[16];

typedef struct {
    GLTVector3 vLocation;
    GLTVector3 vUp;
    GLTVector3 vForward;
} GLTFrame;

#define NUM_SPHERES 40

GLTFrame spheres[NUM_SPHERES];
GLfloat sphereColor[NUM_SPHERES][3];
GLTFrame frameCamera;

void gltVectorCrossProduct(const GLTVector3 vU, const GLTVector3 vV, GLTVector3 vResult) {
    vResult[0] = vU[1] * vV[2] - vV[1] * vU[2];
    vResult[1] = -vU[0] * vV[2] + vV[0] * vU[2];
    vResult[2] = vU[0] * vV[1] - vV[0] * vU[1];
}

void gltLoadIdentityMatrix(GLTMatrix m) {
    static GLTMatrix identity = {1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f,
                                 0.0f, 0.0f, 0.0f, 0.0f, 1.0f};
    memcpy(m, identity, sizeof(GLTMatrix));
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

void gltRotateVector(const GLTVector3 vSrcVector, const GLTMatrix mMatrix, GLTVector3 vOut) {
    vOut[0] = mMatrix[0] * vSrcVector[0] + mMatrix[4] * vSrcVector[1] + mMatrix[8] * vSrcVector[2];
    vOut[1] = mMatrix[1] * vSrcVector[0] + mMatrix[5] * vSrcVector[1] + mMatrix[9] * vSrcVector[2];
    vOut[2] = mMatrix[2] * vSrcVector[0] + mMatrix[6] * vSrcVector[1] + mMatrix[10] * vSrcVector[2];
}

void gltInitFrame(GLTFrame *pFrame) {
    pFrame->vLocation[0] = 0.0f;
    pFrame->vLocation[1] = 0.0f;
    pFrame->vLocation[2] = 0.0f;
    pFrame->vUp[0] = 0.0f;
    pFrame->vUp[1] = 1.0f;
    pFrame->vUp[2] = 0.0f;
    pFrame->vForward[0] = 0.0f;
    pFrame->vForward[1] = 0.0f;
    pFrame->vForward[2] = -1.0f;
}

void gltGetMatrixFromFrame(GLTFrame *pFrame, GLTMatrix mMatrix) {
    GLTVector3 vXAxis;
    gltVectorCrossProduct(pFrame->vUp, pFrame->vForward, vXAxis);
    memcpy(mMatrix, vXAxis, sizeof(GLTVector3));
    mMatrix[3] = 0.0f;
    memcpy(mMatrix + 4, pFrame->vUp, sizeof(GLTVector3));
    mMatrix[7] = 0.0f;
    memcpy(mMatrix + 8, pFrame->vForward, sizeof(GLTVector3));
    mMatrix[11] = 0.0f;
    memcpy(mMatrix + 12, pFrame->vLocation, sizeof(GLTVector3));
    mMatrix[15] = 1.0f;
}

void gltApplyActorTransform(GLTFrame *pFrame) {
    GLTMatrix mTransform;
    gltGetMatrixFromFrame(pFrame, mTransform);
    glMultMatrixf(mTransform);
}

void gltApplyCameraTransform(GLTFrame *pCamera) {
    GLTMatrix mMatrix;
    GLTVector3 vAxisX;
    GLTVector3 zFlipped;
    zFlipped[0] = -pCamera->vForward[0];
    zFlipped[1] = -pCamera->vForward[1];
    zFlipped[2] = -pCamera->vForward[2];
    gltVectorCrossProduct(pCamera->vUp, zFlipped, vAxisX);
    mMatrix[0] = vAxisX[0];
    mMatrix[4] = vAxisX[1];
    mMatrix[8] = vAxisX[2];
    mMatrix[12] = 0.0f;
    mMatrix[1] = pCamera->vUp[0];
    mMatrix[5] = pCamera->vUp[1];
    mMatrix[9] = pCamera->vUp[2];
    mMatrix[13] = 0.0f;
    mMatrix[2] = zFlipped[0];
    mMatrix[6] = zFlipped[1];
    mMatrix[10] = zFlipped[2];
    mMatrix[14] = 0.0f;
    mMatrix[3] = 0.0f;
    mMatrix[7] = 0.0f;
    mMatrix[11] = 0.0f;
    mMatrix[15] = 1.0f;
    glMultMatrixf(mMatrix);
    glTranslatef(-pCamera->vLocation[0], -pCamera->vLocation[1], -pCamera->vLocation[2]);
}

void gltMoveFrameForward(GLTFrame *pFrame, GLfloat fStep) {
    pFrame->vLocation[0] += pFrame->vForward[0] * fStep;
    pFrame->vLocation[1] += pFrame->vForward[1] * fStep;
    pFrame->vLocation[2] += pFrame->vForward[2] * fStep;
}

void gltRotateFrameLocalY(GLTFrame *pFrame, GLfloat fAngle) {
    GLTMatrix mRotation;
    GLTVector3 vNewForward;
    GLTVector3 vNewUp;
    gltRotationMatrix(gltDegToRad(fAngle), 0.0f, 1.0f, 0.0f, mRotation);
    gltRotateVector(pFrame->vForward, mRotation, vNewForward);
    memcpy(pFrame->vForward, vNewForward, sizeof(GLTVector3));
    gltRotateVector(pFrame->vUp, mRotation, vNewUp);
    memcpy(pFrame->vUp, vNewUp, sizeof(GLTVector3));
}

void DrawGround(void) {
    GLfloat fExtent = 5.0f;
    GLfloat fStep = 1.0f;
    GLfloat y = -0.4f;
    GLint iLine;
    glBegin(GL_LINES);
    for (iLine = (GLint)-fExtent; iLine <= (GLint)fExtent; iLine += (GLint)fStep) {
        glVertex3f((GLfloat)iLine, y, fExtent);
        glVertex3f((GLfloat)iLine, y, -fExtent);
        glVertex3f(fExtent, y, (GLfloat)iLine);
        glVertex3f(-fExtent, y, (GLfloat)iLine);
    }
    glEnd();
}

void RenderScene(void) {
    int i;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glPushMatrix();
    gltApplyCameraTransform(&frameCamera);

    DrawGround();

    glDisable(GL_LIGHTING);
    for (i = 0; i < NUM_SPHERES; i++) {
        glPushMatrix();
        gltApplyActorTransform(&spheres[i]);
        glColor3f(sphereColor[i][0], sphereColor[i][1], sphereColor[i][2]);
        glutSolidSphere(0.1f, 13, 26);
        glPopMatrix();
    }

    glPopMatrix();
    glutSwapBuffers();
}

void SpecialKeys(int key, int, int) {
    if (key == GLUT_KEY_UP)
        gltMoveFrameForward(&frameCamera, 0.1f);
    if (key == GLUT_KEY_DOWN)
        gltMoveFrameForward(&frameCamera, -0.1f);
    if (key == GLUT_KEY_LEFT)
        gltRotateFrameLocalY(&frameCamera, 0.1f);
    if (key == GLUT_KEY_RIGHT)
        gltRotateFrameLocalY(&frameCamera, -0.1f);
    glutPostRedisplay();
}

void TimerFunction(int value) {
    glutPostRedisplay();
    glutTimerFunc(3, TimerFunction, 1);
}

void ChangeSize(int w, int h) {
    GLfloat fAspect;
    if (h == 0)
        h = 1;
    glViewport(0, 0, w, h);
    fAspect = (GLfloat)w / (GLfloat)h;
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(25.0f, fAspect, 0.2f, 12.0f);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

void SetupRC() {
    int iSphere;
    srand((unsigned)time(nullptr));

    glClearColor(0.0f, 0.0f, 0.45f, 1.0f);
    glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
    glEnable(GL_DEPTH_TEST);
    gltInitFrame(&frameCamera);

    for (iSphere = 0; iSphere < NUM_SPHERES; iSphere++) {
        gltInitFrame(&spheres[iSphere]);
        spheres[iSphere].vLocation[0] = (float)((rand() % 160) - 80) * 0.05f;
        spheres[iSphere].vLocation[1] = 0.0f;
        spheres[iSphere].vLocation[2] = -4.0f - (float)iSphere * (6.0f / (float)(NUM_SPHERES - 1));
        sphereColor[iSphere][0] = (float)(rand() % 100) / 100.0f;
        sphereColor[iSphere][1] = (float)(rand() % 100) / 100.0f;
        sphereColor[iSphere][2] = (float)(rand() % 100) / 100.0f;
    }
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Listing 5 - 40 spheres on different z levels (p.3)");
    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);
    glutSpecialFunc(SpecialKeys);
    SetupRC();
    glutTimerFunc(33, TimerFunction, 1);
    glutMainLoop();
    return 0;
}
