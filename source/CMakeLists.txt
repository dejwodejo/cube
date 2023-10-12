set(SOURCE_CPP_FILES
	"${CMAKE_CURRENT_SOURCE_DIR}/main.cpp"
)

set(SOURCE_HEADER_FILES

)

set(SOURCE_CODE
	"${SOURCE_CPP_FILES}"
	"${SOURCE_HEADER_FILES}"
)

add_executable(${EXECUTABLE_NAME} ${SOURCE_CODE})

#----
# link dependencies

# volk
add_dependencies(${EXECUTABLE_NAME} volk)
target_include_directories(${EXECUTABLE_NAME} PUBLIC "$<TARGET_PROPERTY:volk,INCLUDE_DIRECTORIES>")
target_link_libraries(${EXECUTABLE_NAME} PUBLIC volk)