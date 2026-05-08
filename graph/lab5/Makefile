CXX = clang++
CXXFLAGS = -std=c++11 -Wall -O2
FRAMEWORKS = -framework OpenGL -framework GLUT

SRCS = 01_cube_textura.cpp 02_tetrahedron_1d.cpp 03_corridor.cpp 04_torus_sphere_surface.cpp
BINS = $(SRCS:.cpp=)

all: $(BINS)

%: %.cpp
	$(CXX) $(CXXFLAGS) -o $@ $< $(FRAMEWORKS)

clean:
	rm -f $(BINS)

.PHONY: all clean
