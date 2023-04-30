#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#define MAX_FILE_NAME 30
#define MAX_COURSE_NAME 30
#define MAX_LINE_SIZE 1000

void readFirstCourses(FILE * file, char * vertices[]) {

}

void createGraphAndWork(){
    int E[MAX_LINE_SIZE][MAX_LINE_SIZE];

    for(int i = 0; i < MAX_LINE_SIZE; i++){
        for(int j = 0; j < MAX_LINE_SIZE; j++){
            E[i][j] = 0; //Initialize to 0
        }
    }
}

int edgeExists(int N, int E[][N], int v1, int v2){
    if(v1 >= N || v1 < 0 || v2 >= N || v2 < 0) return -1;
    return E[v1][v2];
}

void addEdge(int N, int E[][N], int v1, int v2){
    if(v1 >= N || v1 < 0 || v2 >= N || v2 < 0) return;
    E[v1][v2] = 1; 
}

void removeEdge(int N, int E[][N], int v1, int v2){
    if(v1 >= N || v1 < 0 || v2 >= N || v2 < 0) return;
    E[v1][v2] = 0;
}

int main() {
    FILE * file;
    char fileName[MAX_FILE_NAME];

    printf("This program will read from a file, a list of courses and their prerequisites and will print the list in which to take courses.\n");
    printf("Enter Filename: ");
    scanf("%s", fileName);
    file = fopen(fileName, "r");

    if(file) {
        char * vertices[MAX_LINE_SIZE];
        readFirstCourses(file, vertices);
        fclose(file);
    } else {
        printf("Could not open file %s. Exit\n", fileName);
    }
    
    return 0;
}