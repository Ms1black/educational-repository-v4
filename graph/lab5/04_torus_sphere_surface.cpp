#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
#include <GLUT/glut.h>
#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#else
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#endif

#include <cmath>
#include <cstdio>
#include <cstdlib>

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

enum TextureSlot {
    TEX_SAND = 0,
    TEX_MARBLE,
    TEX_MOON,
    TEX_BRICK,
    TEX_ASPHALT,
    TEX_TOTAL
};

GLuint gTextures[TEX_TOTAL] = {0};
float gRot = 0.0f;

const char* kTextureFiles[TEX_TOTAL] = {
    "textures/sand.tga",        
    "textures/marble.tga",      
    "textures/moon_landscape.tga", 
    "textures/brick_wall.tga",  
    "textures/asphalt.tga",     
};

void MakeFallback(GLuint tex, unsigned char r, unsigned char g, unsigned char b) {
    unsigned char pixels[64 * 64 * 3];
    for (int y = 0; y < 64; ++y) {
        for (int x = 0; x < 64; ++x) {
            const int idx = (y * 64 + x) * 3;
            const int checker = ((x / 8 + y / 8) % 2) ? 24 : -24;
            const int rr = r + checker;
            const int gg = g + checker;
            const int bb = b + checker;
            pixels[idx + 0] = static_cast<unsigned char>(rr < 0 ? 0 : (rr > 255 ? 255 : rr));
            pixels[idx + 1] = static_cast<unsigned char>(gg < 0 ? 0 : (gg > 255 ? 255 : gg));
            pixels[idx + 2] = static_cast<unsigned char>(bb < 0 ? 0 : (bb > 255 ? 255 : bb));
        }
    }
    glBindTexture(GL_TEXTURE_2D, tex);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 64, 64, 0, GL_RGB, GL_UNSIGNED_BYTE, pixels);
}

void LoadTexture(GLuint tex, const char* filePath, unsigned char fr, unsigned char fg, unsigned char fb) {
    int w = 0;
    int h = 0;
    int ch = 0;
    unsigned char* data = stbi_load(filePath, &w, &h, &ch, 0);
    glBindTexture(GL_TEXTURE_2D, tex);
    if (!data) {
        std::fprintf(stderr, "Не удалось открыть %s, используется fallback\n", filePath);
        MakeFallback(tex, fr, fg, fb);
    } else {
        const GLenum fmt = (ch == 4) ? GL_RGBA : ((ch == 1) ? GL_LUMINANCE : GL_RGB);
        glTexImage2D(GL_TEXTURE_2D, 0, fmt, w, h, 0, fmt, GL_UNSIGNED_BYTE, data);
        stbi_image_free(data);
    }
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
}

void DrawTexturedTorus(float majorR, float minorR, int numMajor, int numMinor) {
    const float twopi = 2.0f * static_cast<float>(M_PI);
    for (int i = 0; i < numMajor; ++i) {
        float a0 = i * twopi / numMajor;
        float a1 = (i + 1) * twopi / numMajor;
        float x0 = std::cos(a0);
        float y0 = std::sin(a0);
        float x1 = std::cos(a1);
        float y1 = std::sin(a1);

        glBegin(GL_TRIANGLE_STRIP);
        for (int j = 0; j <= numMinor; ++j) {
            float b = j * twopi / numMinor;
            float c = std::cos(b);
            float s = std::sin(b);
            float r = majorR + minorR * c;

            
            float nx = x0 * c;
            float ny = y0 * c;
            float nz = s;
            glNormal3f(nx, ny, nz);
            glTexCoord2f(static_cast<float>(i) / numMajor, static_cast<float>(j) / numMinor);
            glVertex3f(x0 * r, y0 * r, minorR * s);

            
            nx = x1 * c;
            ny = y1 * c;
            nz = s;
            glNormal3f(nx, ny, nz);
            glTexCoord2f(static_cast<float>(i + 1) / numMajor, static_cast<float>(j) / numMinor);
            glVertex3f(x1 * r, y1 * r, minorR * s);
        }
        glEnd();
    }
}

void DrawGroundSurface(float size, int steps) {
    const float step = size / steps;
    const float half = size * 0.5f;
    for (int z = 0; z < steps; ++z) {
        glBegin(GL_TRIANGLE_STRIP);
        for (int x = 0; x <= steps; ++x) {
            float xf = -half + x * step;
            float z0 = -half + z * step;
            float z1 = -half + (z + 1) * step;
            glNormal3f(0.0f, 1.0f, 0.0f);
            glTexCoord2f(x * 0.35f, z * 0.35f);
            glVertex3f(xf, -1.2f, z0);
            glTexCoord2f(x * 0.35f, (z + 1) * 0.35f);
            glVertex3f(xf, -1.2f, z1);
        }
        glEnd();
    }
}

void DrawCustomObjects() {
    
    glBindTexture(GL_TEXTURE_2D, gTextures[TEX_BRICK]);
    glPushMatrix();
    glTranslatef(-3.1f, -0.35f, 1.6f);
    glRotatef(-gRot * 1.3f, 0.0f, 1.0f, 0.0f);
    glutSolidCube(1.1f);
    glPopMatrix();

    
    glBindTexture(GL_TEXTURE_2D, gTextures[TEX_ASPHALT]);
    glPushMatrix();
    glTranslatef(3.0f, -0.4f, -1.6f);
    glRotatef(gRot * 1.1f, 0.0f, 1.0f, 0.0f);
    const GLfloat sPlane[] = {0.3f, 0.0f, 0.0f, 0.5f};
    const GLfloat tPlane[] = {0.0f, 0.0f, 0.3f, 0.5f};
    glTexGeni(GL_S, GL_TEXTURE_GEN_MODE, GL_OBJECT_LINEAR);
    glTexGeni(GL_T, GL_TEXTURE_GEN_MODE, GL_OBJECT_LINEAR);
    glTexGenfv(GL_S, GL_OBJECT_PLANE, sPlane);
    glTexGenfv(GL_T, GL_OBJECT_PLANE, tPlane);
    glEnable(GL_TEXTURE_GEN_S);
    glEnable(GL_TEXTURE_GEN_T);
    glutSolidTeapot(0.6);
    glDisable(GL_TEXTURE_GEN_S);
    glDisable(GL_TEXTURE_GEN_T);
    glPopMatrix();
}

void RenderScene() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(0.0, 3.0, 10.0, 0.0, -0.2, 0.0, 0.0, 1.0, 0.0);

    const GLfloat lightPos[] = {3.5f, 5.0f, 4.0f, 1.0f};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);

    glEnable(GL_TEXTURE_2D);

    
    glBindTexture(GL_TEXTURE_2D, gTextures[TEX_MOON]);
    DrawGroundSurface(14.0f, 50);

    
    glPushMatrix();
    glTranslatef(-2.3f, 0.5f, 0.0f);
    glRotatef(gRot, 1.0f, 1.0f, 0.0f);
    glBindTexture(GL_TEXTURE_2D, gTextures[TEX_SAND]);
    DrawTexturedTorus(1.2f, 0.45f, 50, 30);
    glPopMatrix();

    
    glPushMatrix();
    glTranslatef(2.4f, 0.8f, 0.2f);
    glRotatef(-gRot * 1.4f, 0.0f, 1.0f, 0.0f);
    glBindTexture(GL_TEXTURE_2D, gTextures[TEX_MARBLE]);
    GLUquadric* q = gluNewQuadric();
    gluQuadricTexture(q, GL_TRUE);
    gluQuadricNormals(q, GLU_SMOOTH);
    gluSphere(q, 1.15, 48, 36);
    gluDeleteQuadric(q);
    glPopMatrix();

    DrawCustomObjects();
    glutSwapBuffers();
}

void TimerFunc(int) {
    gRot += 0.7f;
    if (gRot > 360.0f) gRot -= 360.0f;
    glutPostRedisplay();
    glutTimerFunc(33, TimerFunc, 1);
}

void ChangeSize(int w, int h) {
    if (h == 0) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(45.0f, static_cast<float>(w) / static_cast<float>(h), 0.2f, 100.0f);
    glMatrixMode(GL_MODELVIEW);
}

void SetupRC() {
    stbi_set_flip_vertically_on_load(1);
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_NORMALIZE);
    glEnable(GL_COLOR_MATERIAL);
    glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE);

    const GLfloat globalAmb[] = {0.12f, 0.12f, 0.12f, 1.0f};
    const GLfloat diff[] = {0.9f, 0.9f, 0.9f, 1.0f};
    const GLfloat spec[] = {1.0f, 1.0f, 1.0f, 1.0f};
    const GLfloat shininess[] = {84.0f};
    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmb);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, diff);
    glLightfv(GL_LIGHT0, GL_SPECULAR, spec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, spec);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SHININESS, shininess);

    glGenTextures(TEX_TOTAL, gTextures);
    LoadTexture(gTextures[TEX_SAND], kTextureFiles[TEX_SAND], 165, 140, 95);
    LoadTexture(gTextures[TEX_MARBLE], kTextureFiles[TEX_MARBLE], 180, 180, 188);
    LoadTexture(gTextures[TEX_MOON], kTextureFiles[TEX_MOON], 112, 112, 122);
    LoadTexture(gTextures[TEX_BRICK], kTextureFiles[TEX_BRICK], 145, 80, 60);
    LoadTexture(gTextures[TEX_ASPHALT], kTextureFiles[TEX_ASPHALT], 70, 70, 70);

    glTexEnvi(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE);
    glClearColor(0.04f, 0.05f, 0.08f, 1.0f);
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(980, 680);
    glutCreateWindow("Lab5 #4 - textured torus/sphere/surface + specular");
    glutReshapeFunc(ChangeSize);
    glutDisplayFunc(RenderScene);
    glutTimerFunc(33, TimerFunc, 1);
    SetupRC();
    glutMainLoop();
    return 0;
}
