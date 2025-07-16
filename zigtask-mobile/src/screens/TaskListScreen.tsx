import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Task, TaskStatus, TaskStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { taskService } from '../services/taskService';
import { storage } from '../utils/storage';
import { networkUtil } from '../utils/network';
import { websocketService } from '../services/websocketService';
import TaskItem from '../components/TaskItem';
import { SafeAreaView } from 'react-native-safe-area-context';

const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<TaskStackParamList, 'TaskList'>>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(networkUtil.isOnline());

  // WebSocket event handlers
  const setupWebSocketListeners = () => {
    websocketService.onTaskCreated((eventData) => {
      if (eventData.task) {
        setTasks(prevTasks => [...prevTasks, eventData.task]);
        console.log('📱 Real-time task created:', eventData.task.title);
      }
    });

    websocketService.onTaskUpdated((eventData) => {
      if (eventData.task) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === eventData.task!.id ? eventData.task! : task
          )
        );
        console.log('📱 Real-time task updated:', eventData.task.title);
      }
    });

    websocketService.onTaskDeleted((eventData) => {
      setTasks(prevTasks => 
        prevTasks.filter(task => task.id !== eventData.taskId)
      );
      console.log('📱 Real-time task deleted:', eventData.taskId);
    });

    websocketService.onTaskStatusChanged((eventData) => {
      if (eventData.task) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === eventData.task!.id ? eventData.task! : task
          )
        );
        console.log('📱 Real-time task status changed:', eventData.task.title, eventData.newStatus);
      }
    });
  };

  useEffect(() => {
    loadTasks();
    
    // Initialize WebSocket for real-time updates
    setupWebSocketListeners();
    
    // Listen for network changes
    const unsubscribe = networkUtil.addListener((online) => {
      setIsOnline(online);
      if (online) {
        syncOfflineActions();
        loadTasks();
        // Reconnect WebSocket when back online
        websocketService.connect();
      }
    });

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  const loadTasks = async (forceRefresh = false) => {
    try {
      setIsLoading(true);

      if (networkUtil.isOnline()) {
        // Online: Fetch from API
        const fetchedTasks = await taskService.getTasks();
        setTasks(fetchedTasks);
        // Cache the tasks
        await storage.cacheData('tasks', fetchedTasks);
      } else {
        // Offline: Load from cache
        const cachedTasks = await storage.getCachedData<Task[]>('tasks');
        if (cachedTasks) {
          setTasks(cachedTasks);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Try to load from cache on error
      const cachedTasks = await storage.getCachedData<Task[]>('tasks');
      if (cachedTasks) {
        setTasks(cachedTasks);
      }
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTasks(true);
    setIsRefreshing(false);
  }, []);

  const syncOfflineActions = async () => {
    try {
      const offlineActions = await storage.getOfflineActions();
      
      for (const action of offlineActions) {
        try {
          switch (action.type) {
            case 'CREATE':
              await taskService.createTask(action.data);
              break;
            case 'UPDATE':
              await taskService.updateTask(action.data.id, action.data);
              break;
            case 'DELETE':
              await taskService.deleteTask(action.data.id);
              break;
          }
          await storage.removeOfflineAction(action.id);
        } catch (error) {
          console.error('Error syncing action:', action, error);
        }
      }
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistically update UI
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      if (networkUtil.isOnline()) {
        await taskService.updateTaskStatus(taskId, newStatus);
      } else {
        // Store action for later sync
        await storage.addOfflineAction({
          type: 'UPDATE',
          data: { id: taskId, status: newStatus },
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update
      await loadTasks();
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI
              setTasks(prev => prev.filter(task => task.id !== taskId));

              if (networkUtil.isOnline()) {
                await taskService.deleteTask(taskId);
              } else {
                // Store action for later sync
                await storage.addOfflineAction({
                  type: 'DELETE',
                  data: { id: taskId },
                });
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              // Revert optimistic update
              await loadTasks();
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('TaskForm', { taskId: task.id });
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onStatusChange={handleStatusChange}
      onDelete={handleDeleteTask}
      onEdit={handleEditTask}
    />
  );

  const renderHiddenItem = ({ item }: { item: Task }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity
        style={[styles.hiddenButton, styles.editButton]}
        onPress={() => handleEditTask(item)}
      >
        <Ionicons name="pencil" size={20} color="white" />
        <Text style={styles.hiddenButtonText}>Edit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.hiddenButton, styles.deleteButton]}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Ionicons name="trash" size={20} color="white" />
        <Text style={styles.hiddenButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Ionicons name="cloud-offline" size={16} color="white" />
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TaskForm', {})}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <SwipeListView
        data={tasks}
        renderItem={renderTask}
        renderHiddenItem={renderHiddenItem}
        keyExtractor={(item) => item.id}
        rightOpenValue={-160}
        disableRightSwipe={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        style={styles.list}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first task</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineBar: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  hiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  hiddenButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  hiddenButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TaskListScreen; 