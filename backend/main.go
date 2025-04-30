package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)


type Todo struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"createdAt"`
}

type TodoStore struct {
	sync.RWMutex
	todos map[int]Todo
	nextID int
}


func NewTodoStore() *TodoStore {
	return &TodoStore{
		todos: make(map[int]Todo),
		nextID: 1,
	}
}

func (s *TodoStore) GetTodos() []Todo {
	s.RLock()
	defer s.RUnlock()
	
	todos := make([]Todo, 0, len(s.todos))
	for _, todo := range s.todos {
		todos = append(todos, todo)
	}
	return todos
}

func (s *TodoStore) GetTodo(id int) (Todo, bool) {
	s.RLock()
	defer s.RUnlock()
	
	todo, ok := s.todos[id]
	return todo, ok
}

func (s *TodoStore) CreateTodo(title string) Todo {
	s.Lock()
	defer s.Unlock()
	
	todo := Todo{
		ID:        s.nextID,
		Title:     title,
		Completed: false,
		CreatedAt: time.Now(),
	}
	
	s.todos[todo.ID] = todo
	s.nextID++
	
	return todo
}


func (s *TodoStore) UpdateTodo(id int, title string, completed bool) (Todo, bool) {
	s.Lock()
	defer s.Unlock()
	
	todo, ok := s.todos[id]
	if !ok {
		return Todo{}, false
	}
	
	todo.Title = title
	todo.Completed = completed
	
	s.todos[id] = todo
	
	return todo, true
}

func (s *TodoStore) DeleteTodo(id int) bool {
	s.Lock()
	defer s.Unlock()
	
	_, ok := s.todos[id]
	if !ok {
		return false
	}
	
	delete(s.todos, id)
	
	return true
}

type Server struct {
	store *TodoStore
}


func NewServer(store *TodoStore) *Server {
	return &Server{store: store}
}


func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func (s *Server) handleGetTodos(w http.ResponseWriter, r *http.Request) {
	todos := s.store.GetTodos()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func (s *Server) handleGetTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/api/todos/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid todo ID", http.StatusBadRequest)
		return
	}
	
	todo, ok := s.store.GetTodo(id)
	if !ok {
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

func (s *Server) handleCreateTodo(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title string `json:"title"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}
	
	todo := s.store.CreateTodo(req.Title)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

func (s *Server) handleUpdateTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/api/todos/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid todo ID", http.StatusBadRequest)
		return
	}
	
	var req struct {
		Title     string `json:"title"`
		Completed bool   `json:"completed"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	todo, ok := s.store.UpdateTodo(id, req.Title, req.Completed)
	if !ok {
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

func (s *Server) handleDeleteTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/api/todos/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid todo ID", http.StatusBadRequest)
		return
	}
	
	if ok := s.store.DeleteTodo(id); !ok {
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/api/todos" && r.Method == "GET" {
		s.handleGetTodos(w, r)
		return
	}
	
	if r.URL.Path == "/api/todos" && r.Method == "POST" {
		s.handleCreateTodo(w, r)
		return
	}
	
	if r.URL.Path[:len("/api/todos/")] == "/api/todos/" && r.Method == "GET" {
		s.handleGetTodo(w, r)
		return
	}
	
	if r.URL.Path[:len("/api/todos/")] == "/api/todos/" && r.Method == "PUT" {
		s.handleUpdateTodo(w, r)
		return
	}
	
	if r.URL.Path[:len("/api/todos/")] == "/api/todos/" && r.Method == "DELETE" {
		s.handleDeleteTodo(w, r)
		return
	}
	
	http.Error(w, "Not found", http.StatusNotFound)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	store := NewTodoStore()
	server := NewServer(store)
	
	
	fmt.Printf("Server is running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, enableCORS(server)))
}