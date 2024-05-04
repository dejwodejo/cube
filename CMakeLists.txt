cmake_minimum_required(VERSION 3.29)
project(cube VERSION 1.0.0)
cmake_policy(SET CMP0072 NEW)

find_package(OpenGL REQUIRED)

add_executable( cube 
    src/config.h 
    src/main.cpp
    src/glad.h
    src/glad.c
)

target_link_libraries(cube glfw OpenGL::GL)