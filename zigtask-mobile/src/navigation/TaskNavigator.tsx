import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskStackParamList } from '../types';
import TaskListScreen from '../screens/TaskListScreen';
import TaskFormScreen from '../screens/TaskFormScreen';

const Stack = createNativeStackNavigator<TaskStackParamList>();

const TaskNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{
          title: 'Tasks',
        }}
      />
      <Stack.Screen 
        name="TaskForm" 
        component={TaskFormScreen}
        options={({ route }) => ({
          title: route.params?.taskId ? 'Edit Task' : 'New Task',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
};

export default TaskNavigator; 