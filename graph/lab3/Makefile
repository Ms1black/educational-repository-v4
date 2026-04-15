# macOS: GLUT + OpenGL
CXX = clang++
CXXFLAGS = -std=c++11 -Wall -O2
FRAMEWORKS = -framework OpenGL -framework GLUT

SRCS = listing1.cpp listing2.cpp listing3.cpp listing4.cpp listing5.cpp
BINS = $(SRCS:.cpp=)

all: $(BINS)

%: %.cpp
	$(CXX) $(CXXFLAGS) -o $@ $< $(FRAMEWORKS)

clean:
	rm -f $(BINS)

.PHONY: all clean
