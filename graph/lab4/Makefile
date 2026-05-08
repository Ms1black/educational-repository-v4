CXX = clang++
CXXFLAGS = -std=c++11 -Wall -O2
FRAMEWORKS = -framework OpenGL -framework GLUT

SRCS = \
	01_pyramid_shading.cpp \
	02_car_lightmodel_colormaterial.cpp \
	03_car_four_lights.cpp \
	04_car_specular.cpp \
	05_three_spotlights.cpp \
	06_shadow_three_lights_tilted_ground.cpp \
	07_reflection.cpp \
	08_fog_menu.cpp \
	09_antialiasing.cpp

BINS = $(SRCS:.cpp=)

all: $(BINS)

%: %.cpp
	$(CXX) $(CXXFLAGS) -o $@ $< $(FRAMEWORKS)

clean:
	rm -f $(BINS)

.PHONY: all clean
