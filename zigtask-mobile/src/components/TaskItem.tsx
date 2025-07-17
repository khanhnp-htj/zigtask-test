import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus, TaskPriority, TaskItemProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return '#FF6B6B';
      case TaskStatus.IN_PROGRESS:
        return '#4ECDC4';
      case TaskStatus.DONE:
        return '#45B7D1';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return '#FF4757';
      case TaskPriority.MEDIUM:
        return '#FFA502';
      case TaskPriority.LOW:
        return '#26de81';
      default:
        return theme.colors.textSecondary;
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

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.DONE;
      case TaskStatus.DONE:
        return TaskStatus.TODO;
      default:
        return null;
    }
  };

  const handleStatusPress = () => {
    const nextStatus = getNextStatus(task.status);
    if (nextStatus) {
      onStatusChange(task.id, nextStatus);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={() => onEdit(task)}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.rightHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          </View>
        </View>

        {task.description && (
          <Text style={styles.description} numberOfLines={3}>
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}
            onPress={handleStatusPress}
          >
            <Text style={styles.statusText}>{getStatusLabel(task.status)}</Text>
          </TouchableOpacity>

          {task.dueDate && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.dueDate}>
                {format(new Date(task.dueDate), 'MMM d')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metadata}>
          <Text style={styles.createdAt}>
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: theme.isDark ? '#000' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 12,
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  createdAt: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});

export default TaskItem; 