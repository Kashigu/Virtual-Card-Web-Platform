<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '../../../stores/user.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: { Bar },
  setup() {
    const userStore = useUserStore();
    const chartData = ref(null);
    const loaded = ref(false);

    const fetchData = async () => {
      try {
        const response = await axios.get(`/statistics/${userStore.userId}/getAmountSpentByMonth`);
        const data = response.data;
        console.log(data)
        // Check if the data has labels and data properties
        if (data.labels && data.data) {
          chartData.value = {
            labels: data.labels,
            datasets: [
              {
                backgroundColor: '#3498DB', // Set your desired color for bars
                data: data.data.map(Number),
                label: 'euros'
              },
            ],
          };
          loaded.value = true;
        } else {
          console.error('Invalid data format from API:', data);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    onMounted(fetchData);

    return {
      chartData,
      loaded,
    };
  },
};
</script>

<template>
  <div>
    <Bar v-if="loaded" :data="chartData" />
  </div>
</template>
