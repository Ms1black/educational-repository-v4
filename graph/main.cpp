#define GL_SILENCE_DEPRECATION

#ifdef __APPLE__
    #include <GL/glew.h>
    #include <GLUT/glut.h> 
#else
    #include "glew.h"
    #include "glut.h"
#endif


GLfloat squareHalfSize = 25.0f;


void initSquare(){
    glClear(GL_COLOR_BUFFER_BIT);
    glColor3f(1.0f, 0.0f, 0.0f);
    glRectf(-squareHalfSize, -squareHalfSize, squareHalfSize, squareHalfSize);
    glutSwapBuffers();
}

void resizeSquare(GLfloat delta){
    squareHalfSize += delta;
    if (squareHalfSize > 95.0f) squareHalfSize = 95.0f;
    if (squareHalfSize < 5.0f) squareHalfSize = 5.0f;
    glutPostRedisplay();
}

void keyboard(unsigned char key, int x, int y){
    switch (key) {
        case '+':
        case '=':
            resizeSquare(5.0f);
            break;
        case '-':
        case '_':
            resizeSquare(-5.0f);
            break;
    }
}

void specialKeys(int key, int x, int y){
    switch (key) {
        case GLUT_KEY_UP:
        case GLUT_KEY_PAGE_UP:
            resizeSquare(5.0f);
            break;
        case GLUT_KEY_DOWN:
        case GLUT_KEY_PAGE_DOWN:
            resizeSquare(-5.0f);
            break;
    }
}

void setupRC(void){
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
}
void changeSize(GLsizei w, GLsizei h){
    GLfloat aspectRatio;
    if (h == 0 ) h = 1;
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    aspectRatio = (GLfloat)w / (GLfloat)h;
    if (w <= h )
        glOrtho(-100.0, 100.0, -100.0 / aspectRatio, 100.0 / aspectRatio, 1.0, -1.0);
    else
        glOrtho(-100.0 * aspectRatio, 100.0 * aspectRatio, -100.0, 100.0, 1.0, -1.0);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

int main(int argc, char* argv[]){
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE);
    glutCreateWindow("Lab_work_01");
    glutDisplayFunc(initSquare);
    glutKeyboardFunc(keyboard);
    glutSpecialFunc(specialKeys);
    glutReshapeFunc(changeSize);

    setupRC();
    glutMainLoop();
}