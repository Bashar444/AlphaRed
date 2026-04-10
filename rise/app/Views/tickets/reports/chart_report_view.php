<div class="tickets-monthly-charts">
    <div class="tickets-day-wise-chart card-body">
        <canvas id="tickets-day-wise-chart" style="width: 100%; height: 350px;"></canvas>
    </div>
</div>


<script type="text/javascript">
    $(document).ready(function () {



        new Chart(document.getElementById("tickets-day-wise-chart"), {
            type: 'bar',
            data: {
                labels: <?php echo $labels; ?>,
                datasets: [{
                        label: "<?php echo app_lang('open'); ?>",
                        backgroundColor: "#FF6283",
                        data: <?php echo $open_data; ?>
                    }, {
                        label: "<?php echo app_lang('closed'); ?>",
                        backgroundColor: "#36A2EB",
                        data: <?php echo $closed_data; ?>
                    }]
            },
            options: {
                tooltips: {
                    displayColors: true,
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return  data['labels'][tooltipItem[0]['index']] + " <?php echo app_lang($month) ?>";
                        }
                    }
                },
                scales: {
                    xAxes: [{
                            stacked: true,
                            gridLines: {
                                color: 'rgba(107, 115, 148, 0.1)'
                            }
                        }],
                    yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true
                            },
                            type: 'linear',
                            gridLines: {
                                color: 'rgba(107, 115, 148, 0.1)'
                            }
                        }]
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: {position: 'bottom'}
            }
        });







    });
</script>    

