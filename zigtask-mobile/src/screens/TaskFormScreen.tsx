import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Task, TaskStatus, TaskPriority, CreateTaskDto, TaskStackParamList } from '../types';
import { taskService } from '../services/taskService';
import { storage } from '../utils/storage';
import { networkUtil } from '../utils/network';
import { format } from 'date-fns';

type TaskFormRouteProp = RouteProp<TaskStackParamList, 'TaskForm'>;

interface FormData {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate?: string;
}

const TaskFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TaskFormRouteProp>();
  const { taskId } = route.params;
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const loadedTask = await taskService.getTask(taskId!);
      setTask(loadedTask);
      
      // Populate form with task data
      setValue('title', loadedTask.title);
      setValue('description', loadedTask.description || '');
      setValue('priority', loadedTask.priority);
      setValue('status', loadedTask.status);
      setValue('dueDate', loadedTask.dueDate);
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const taskData: CreateTaskDto = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      };

      if (taskId) {
        // Update existing task
        if (networkUtil.isOnline()) {
          await taskService.updateTask(taskId, taskData);
        } else {
          await storage.addOfflineAction({
            type: 'UPDATE',
            data: { id: taskId, ...taskData },
          });
        }
      } else {
        // Create new task
        if (networkUtil.isOnline()) {
          await taskService.createTask(taskData);
        } else {
          await storage.addOfflineAction({
            type: 'CREATE',
            data: taskData,
          });
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const StatusPickerModal = () => (
    <Modal
      visible={showStatusPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStatusPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Status</Text>
            <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {Object.values(TaskStatus).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.pickerOption,
                watchedValues.status === status && styles.pickerOptionSelected,
              ]}
              onPress={() => {
                setValue('status', status);
                setShowStatusPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  watchedValues.status === status && styles.pickerOptionTextSelected,
                ]}
              >
                {getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const PriorityPickerModal = () => (
    <Modal
      visible={showPriorityPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPriorityPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Priority</Text>
            <TouchableOpacity onPress={() => setShowPriorityPicker(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {Object.values(TaskPriority).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.pickerOption,
                watchedValues.priority === priority && styles.pickerOptionSelected,
              ]}
              onPress={() => {
                setValue('priority', priority);
                setShowPriorityPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  watchedValues.priority === priority && styles.pickerOptionTextSelected,
                ]}
              >
                {getPriorityLabel(priority)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {taskId ? 'Edit Task' : 'New Task'}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          style={[
            styles.saveButton,
            (!isValid || isLoading) && styles.saveButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              (!isValid || isLoading) && styles.saveButtonTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <Controller
            control={control}
            name="title"
            rules={{
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter task title"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoFocus={!taskId}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter task description"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Status Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStatusPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {getStatusLabel(watchedValues.status)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Priority Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPriorityPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {getPriorityLabel(watchedValues.priority)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Due Date - Simple text input for now */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="2024-12-31"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
      </ScrollView>

      <StatusPickerModal />
      <PriorityPickerModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#f44336',
  },
  textArea: {
    height: 100,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TaskFormScreen; 