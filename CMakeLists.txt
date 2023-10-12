cmake_minimum_required(VERSION 3.26)

set(PROJECT_NAME "cpp-masters")
set(EXECUTABLE_NAME "${PROJECT_NAME}-exe")

project(${PROJECT_NAME})

set_property(DIRECTORY PROPERTY VS_STARTUP_PROJECT ${EXECUTABLE_NAME})

# deps
add_subdirectory(3rdparty 3rdparty EXCLUDE_FROM_ALL)
add_subdirectory(source source)