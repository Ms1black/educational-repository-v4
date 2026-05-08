CXX = clang++
CXXFLAGS = -std=c++11 -Wall -O2
FRAMEWORKS = -framework OpenGL -framework GLUT

SRCS = 01_bitmap_variant3.cpp 02_tga_rgb_variant3.cpp 03_transform_variant3.cpp
BINS = $(SRCS:.cpp=)

all: $(BINS)

%: %.cpp
	$(CXX) $(CXXFLAGS) -o $@ $< $(FRAMEWORKS)

clean:
	rm -f $(BINS)

.PHONY: all clean
