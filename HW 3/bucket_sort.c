/* 
 * Updated 2/28/2023 - Brandon Faulkner
 * Program that sorts arrays from a file using bucket sort algorithm
*/

/* 
compile with -g to collect debugging info needed for Valgrind ( -lm links the math library): 
gcc -g bucket_sort.c list.c -lm

run with Valgrind:
valgrind --leak-check=full ./a.out

On some systems, but not all, you can also use the --show-leak-kinds=all flag:
valgrind --leak-check=full --show-leak-kinds=all ./a.out

run without Valgrind:
./a.out
*/


#include <stdlib.h>
#include <stdio.h>
#include <math.h>

#include "list.h"   // useful if you want to use functions from list.c

void print_array(int arr[], int N);
void run1();
void file_to_array(FILE *fp);
void bucket_sort(int * A, int N);
struct node *sort_elements(struct node* bucket);

/* 
// function to insert a new node in a sorted list. E.g.: 
nodePT insert_sorted(nodePT L, nodePT newP);
//or
nodePT insert_sorted(nodePT L, int elem);
//  function to sort an array sing bucket sort. E.g.:
void bucket_sort(int * arr, int N);
*/

void print_array(int arr[], int N){
	int j;
	printf("\n array: ");
	for(j= 0; j<N; j++){
		printf("%5d,", arr[j]);
	}
	printf("\n");
}

//-------------------------------------------------------------

void run1(){
	char filename[50];
	printf("\nEnter the filename: ");
	scanf("%s", filename);

	FILE *fp = fopen(filename, "r");

	if(fp == NULL){
		printf("\nFile could not be opened");
	}
	else{
		file_to_array(fp);
	}
}

void file_to_array(FILE *fp){
	int arrSize;
	fscanf(fp, "%d", &arrSize);

	int arr[arrSize];

	for(int i = 0; i < arrSize; i++){
		fscanf(fp, "%d", &arr[i]);
	}

	print_array(arr,arrSize);

	bucket_sort(arr, arrSize);
}

void bucket_sort(int * A, int N){
	int i,j, min, max;
	struct node * buckets[N];

	//Initialize to empty
	for(i = 0; i < N; i++){
		buckets[i] = NULL;
	}

	min = A[0]; max = A[0];
	//Compute min and max of A
	for(i = 1; i < N; i++){
		if(min > A[i]){
			min = A[i];
		}
		if(max < A[i]){
			max = A[i];
		}      
    }

	printf("\nBucket sort: min=%d, max=%d, N=%d buckets", min, max, N);

	//Calculate idx's
	for(i = 0; i < N; i++){
		j = floor((N * (A[i] - min))/(1 + max - min)); //idx
		insert_front(&buckets[j], A[i]);
		printf("\narr[%d]=   %d, idx = %d", i, A[i], j);
	}

	//Sort elements of each bucket
	for(i = 0; i < N; i++){
		buckets[i] = sort_elements(buckets[i]);
		print_list_horiz(buckets[i]);
	}

	
}

struct node *sort_elements(struct node* list){
	struct node *k, *nodeList;
  if (list == 0 || list->next == 0) {
    return list;
  }

  nodeList = list;
  k = list->next;
  nodeList->next = 0;
  while (k != 0) {
    struct node *ptr;
    if (nodeList->data > k->data) {
      struct node *tmp;
      tmp = k;
      k = k->next;
      tmp->next = nodeList;
      nodeList = tmp;
      continue;
    }

    for (ptr = nodeList; ptr->next != 0; ptr = ptr->next) {
      if (ptr->next->data > k->data)
        break;
    }

    if (ptr->next != 0) {
      struct node *tmp;
      tmp = k;
      k = k->next;
      tmp->next = ptr->next;
      ptr->next = tmp;
      continue;
    } else {
      ptr->next = k;
      k = k->next;
      ptr->next->next = 0;
      continue;
    }
  }
  return nodeList;
}

int main()
{
	printf("This program will read a file name, load data for an array from there and print the sorted array.\n");
	printf("The array is sorted using bucket sort.\n");
	printf("This will be repeated as long as the user wants.\n");
	int option;
	do {
		run1();
		printf("\nDo you want to repeat? Enter 1 to repeat, or 0 to stop) ");
		char ch;
		scanf("%d%c",&option, &ch);  // ch is used to remove the Enter from the input buffer
 	} while (option == 1);

   return 0;
}
