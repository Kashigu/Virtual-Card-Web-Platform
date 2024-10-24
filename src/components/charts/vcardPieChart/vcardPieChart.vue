<script lang="ts">
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';
import axios from 'axios';
import { useUserStore } from '../../../stores/user.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
    name: 'PieChart',
    components: { Pie },
    setup() {
        const userStore = useUserStore();
        const chartData = ref(null);
        const loaded = ref(false);

        const fetchData = async () => {
            try {
                const response = await axios.get(`/statistics/${userStore.userId}/spentByCategory`);
                const data = response.data;

                // Check if the data has labels and data properties
                if (data.labels && data.data) {
                    chartData.value = {
                        labels: data.labels,
                        datasets: [
                            {
                                backgroundColor: [
                                    '#8E44AD',
                                    '#3498DB',
                                    '#E74C3C',
                                    '#27AE60',
                                    '#F39C12',
                                    '#2ECC71',
                                    '#D35400',
                                    '#1ABC9C',
                                    '#9B59B6',
                                    '#2980B9',
                                    '#C0392B',
                                    '#16A085',
                                    '#F1C40F',
                                    '#2C3E50',
                                    '#E67E22',
                                    '#7F8C8D',
                                    '#BDC3C7',
                                    '#34495E',
                                    '#FDEBD0'
                                ],
                                data: data.data.map(Number)
                            }
                        ]
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
            loaded
        };
    }
}
</script>


<template>
    <div class="container">
        <Pie v-if="loaded" :data="chartData" />
    </div>
</template>
  