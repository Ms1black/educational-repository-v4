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
 
 #include <math.h>
 #include <string.h>
 
 #define GLT_PI 3.14159265358979323846f
 
 
 
 
 typedef GLfloat GLTVector3[3];
 typedef GLfloat GLTMatrix[16];
 
 
 GLfloat gltVectorDotProduct(const GLTVector3 vU, const GLTVector3 vV)
 {
     return vU[0]*vV[0] + vU[1]*vV[1] + vU[2]*vV[2];
 }
 
 
 GLfloat gltGetVectorLength(const GLTVector3 v)
 {
     return (GLfloat)sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
 }
 
 
 void gltNormalizeVector(GLTVector3 v)
 {
     GLfloat len = gltGetVectorLength(v);
     if (len > 0.0001f) {
         v[0] /= len; v[1] /= len; v[2] /= len;
     }
 }
 
 
 void gltSubtractVectors(const GLTVector3 a, const GLTVector3 b, GLTVector3 r)
 {
     r[0] = a[0]-b[0]; r[1] = a[1]-b[1]; r[2] = a[2]-b[2];
 }
 
 
 void gltCrossProduct(const GLTVector3 u, const GLTVector3 v, GLTVector3 r)
 {
     r[0] =  u[1]*v[2] - v[1]*u[2];
     r[1] = -u[0]*v[2] + v[0]*u[2];
     r[2] =  u[0]*v[1] - v[0]*u[1];
 }
 
 
 void gltRotateVector(const GLTVector3 src, const GLTMatrix m, GLTVector3 dst)
 {
     dst[0] = m[0]*src[0] + m[4]*src[1] + m[8]*src[2];
     dst[1] = m[1]*src[0] + m[5]*src[1] + m[9]*src[2];
     dst[2] = m[2]*src[0] + m[6]*src[1] + m[10]*src[2];
 }
 
 
 void gltFaceNormal(const GLTVector3 p0, const GLTVector3 p1,
                    const GLTVector3 p2, GLTVector3 n)
 {
     GLTVector3 v1, v2;
     gltSubtractVectors(p1, p0, v1);
     gltSubtractVectors(p2, p0, v2);
     gltCrossProduct(v1, v2, n);
     gltNormalizeVector(n);
 }
 
 
 
 
static GLfloat yRot = 0.0f;    
static GLfloat xRot = 0.0f;
 
 
 
 
 
 
 #define NUM_SHADES 16          
 
 void SetupRC(void)
 {
     
     
     GLubyte yellowTable[NUM_SHADES][3];
     int i;
     for (i = 0; i < NUM_SHADES; i++) {
         float t = (float)i / (float)(NUM_SHADES - 1); 
         
         GLubyte r = (GLubyte)(20 + t * 235);   
         GLubyte g = (GLubyte)(16 + t * 194);   
         GLubyte b = 0;
         yellowTable[i][0] = r;
         yellowTable[i][1] = g;
         yellowTable[i][2] = b;
     }
 
     glClearColor(0.0f, 0.0f, 0.4f, 1.0f); 
     glEnable(GL_DEPTH_TEST);
     glEnable(GL_CULL_FACE);
     glFrontFace(GL_CCW);
 
     
     glTexEnvi(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_DECAL);
 
     
     glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
     glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
     glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_WRAP_S, GL_CLAMP);
 
     glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
 
     
     glTexImage1D(GL_TEXTURE_1D, 0, GL_RGB,
                  NUM_SHADES, 0,
                  GL_RGB, GL_UNSIGNED_BYTE, yellowTable);
 
     glEnable(GL_TEXTURE_1D);
 }
 
 
 
 
 
 
 
 
 
 void DrawToonTetrahedron(GLTVector3 vLightDir)
 {
     GLTMatrix mModelView;
     GLTVector3 vTransNormal;
 
     
     glGetFloatv(GL_MODELVIEW_MATRIX, mModelView);
 
     
     gltNormalizeVector(vLightDir);
 
     
     GLTVector3 v[4] = {
         { 0.0f,       0.6f,       0.0f       },  
         {-0.5657f,   -0.2f,      -0.3266f    },  
         { 0.5657f,   -0.2f,      -0.3266f    },  
         { 0.0f,      -0.2f,       0.6532f    }   
     };
 
     
     int faces[4][3] = {
         {0, 3, 2},  
         {0, 1, 3},  
         {0, 2, 1},  
         {1, 2, 3}   
     };
 
     glBegin(GL_TRIANGLES);
     for (int f = 0; f < 4; f++) {
         
         GLTVector3 faceNorm;
         gltFaceNormal(v[faces[f][0]], v[faces[f][1]], v[faces[f][2]], faceNorm);
 
         
         gltRotateVector(faceNorm, mModelView, vTransNormal);
         gltNormalizeVector(vTransNormal);
 
         
         GLfloat texCoord = gltVectorDotProduct(vLightDir, vTransNormal);
         
         if (texCoord < 0.0f) texCoord = 0.0f;
 
         
         
         for (int k = 0; k < 3; k++) {
             glTexCoord1f(texCoord);
             glVertex3fv(v[faces[f][k]]);
         }
     }
     glEnd();
 }
 
 
 
 
 void RenderScene(void)
 {
     
     GLTVector3 vLightDir = { -1.0f, 1.0f, 1.0f };
 
     glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
 
     glMatrixMode(GL_MODELVIEW);
     glLoadIdentity();
 
    glPushMatrix();
    glTranslatef(-0.8f, 0.0f, -3.0f);
    glRotatef(yRot, 0.0f, 1.0f, 0.0f);
    glRotatef(xRot, 1.0f, 0.0f, 0.0f);
    DrawToonTetrahedron(vLightDir);
    glPopMatrix();

    glPushMatrix();
    glTranslatef(1.0f, -0.05f, -3.2f);
    glRotatef(-yRot * 0.8f, 0.0f, 1.0f, 0.0f);
    glRotatef(xRot * 1.1f, 1.0f, 0.0f, 0.0f);
    
    const GLfloat planeS[] = {1.0f, 0.0f, 0.0f, 0.5f};
    glTexGeni(GL_S, GL_TEXTURE_GEN_MODE, GL_OBJECT_LINEAR);
    glTexGenfv(GL_S, GL_OBJECT_PLANE, planeS);
    glEnable(GL_TEXTURE_GEN_S);
    glutSolidTeapot(0.45);
    glDisable(GL_TEXTURE_GEN_S);
    glPopMatrix();
 
     glutSwapBuffers();
 }
 
 
 
 
 void TimerFunction(int value)
 {
    yRot += 0.6f;
    xRot += 0.35f;
     if (yRot >= 360.0f) yRot -= 360.0f;
    if (xRot >= 360.0f) xRot -= 360.0f;
     glutPostRedisplay();
     glutTimerFunc(33, TimerFunction, 1);
 }
 
 
 
 
 void ChangeSize(int w, int h)
 {
     if (h == 0) h = 1;
     glViewport(0, 0, w, h);
 
     GLfloat fAspect = (GLfloat)w / (GLfloat)h;
     glMatrixMode(GL_PROJECTION);
     glLoadIdentity();
     gluPerspective(35.0f, fAspect, 1.0f, 50.0f);
     glMatrixMode(GL_MODELVIEW);
     glLoadIdentity();
 }

 
 int main(int argc, char *argv[])
 {
     glutInit(&argc, argv);
     glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
     glutInitWindowSize(800, 600);
     glutCreateWindow("Задание 2 (Вариант 3) — Тетраэдр с 1D текстурой (жёлтый, 16 градаций)");
 
     glutReshapeFunc(ChangeSize);
     glutDisplayFunc(RenderScene);
     glutTimerFunc(33, TimerFunction, 1);
 
     SetupRC();
     glutMainLoop();
     return 0;
 }