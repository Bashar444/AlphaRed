<div class="leads-monthly-charts">
    <div class="leads-day-wise-chart card-body">
        <canvas id="leads-day-wise-chart" style="width: 100%; height: 350px;"></canvas>
    </div>

    <div class="card-body source-and-owner-wise-chart mt50 b-t pt40">
        <div class="row mb30">
            <div class="col-md-6 b-r">
                <div class="mt20"><strong><?php echo app_lang("lead_source"); ?></strong></div>
                <div class="mt20 pt10">
                    <canvas id="leads-source-wise-chart" style="width:100%; height: 300px;"></canvas>
                </div>

            </div>
            <div class="col-md-6">
                <div class="mt20"><strong><?php echo app_lang("owner"); ?></strong></div>
                <div class="mt20 pt10">
                    <canvas id="leads-owner-wise-chart" style="width:100%; height: 300px;"></canvas>
                </div>
            </div>

        </div>
    </div>
</div>


<script type="text/javascript">
    $(document).ready(function () {

        new Chart(document.getElementById("leads-day-wise-chart"), {
            type: 'line',
            data: {
                labels: <?php echo $day_wise_labels; ?>,
                datasets: [{
                        label: '<?php echo app_lang("converted_to_client"); ?>',
                        data: <?php echo $day_wise_data; ?>,
                        fill: true,
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2
                    }]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return  data['labels'][tooltipItem[0]['index']] + " <?php echo app_lang($month) ?>";
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: "#898fa9"
                    }
                },
                scales: {
                    xAxes: [
                        {
                            ticks: {
                                autoSkip: true,
                                fontColor: "#898fa9"
                            },
                            gridLines: {
                                color: 'rgba(107, 115, 148, 0.1)'
                            }
                        }
                    ],
                    yAxes: [{
                            gridLines: {
                                color: 'rgba(107, 115, 148, 0.1)'
                            },
                            ticks: {
                                fontColor: "#898fa9"
                            }
                        }]
                }
            }

        });





        var colorPlate = [
            '#14BAA0', '#FF3D67', '#3B81F6',  '#6165F2', '#F59F0F', '#FBCD16', '#E84C3D','#40E0D0', '#E67F22', 
            '#36A2EB', '#FF6283', '#4BC0C0', '#FF9F40', '#32CD32', '#9370DB', '#FFD700', '#008080', '#FF6347', '#7B68EE',
            '#40E0D0', '#FF4500', '#6A5ACD', '#00FF7F', '#8B008B', '#FF8C00', '#00CED1', '#FF69B4', '#48D1CC', '#FF1493',
            '#1E90FF', '#ADFF2F', '#8A2BE2', '#00FF00', '#9932CC', '#228B22', '#BA55D3', '#3CB371', '#800000', '#7FFFD4',
            '#8B0000', '#00FFFF', '#DC143C', '#00FF8C', '#FF0000', '#7FFF00', '#B22222', '#00FA9A', '#FF7F50', '#ADFF2F',
            '#8B4513', '#20B2AA', '#CD5C5C', '#98FB98', '#800080', '#66CDAA', '#FA8072', '#9ACD32', '#FF4500', '#8FBC8B'
        ];
        var owner_wise_data = <?php echo $owner_wise_data; ?>;

        var color = owner_wise_data.length <= 50 ? colorPlate.slice(0, owner_wise_data.length) : generateColors(owner_wise_data.length);


        new Chart(document.getElementById("leads-owner-wise-chart"), {
            type: 'pie',
            data: {
                labels: <?php echo $owner_wise_labels; ?>,
                datasets: [
                    {
                        data: owner_wise_data,
                        backgroundColor: color,
                        borderWidth: 0
                    }]
            },
            options: {
                cutoutPercentage:60,
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {

                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: "#898fa9"
                    }
                },
                animation: {
                    animateScale: true
                }
            }
        });

        // generate random color
        function generateColors(count) {
            var colors = [];

            for (var i = 0; i < count; i++) {
                var color = '#' + Math.floor(Math.random() * 12345678).toString(16);
                colors.push(color);
            }
            return colors;
        }




        new Chart(document.getElementById("leads-source-wise-chart"), {
            type: 'bar',
            data: {
                labels: <?php echo $source_wise_labels; ?>,
                datasets: [{
                        label: "<?php echo app_lang('lead_source'); ?>",
                        data: <?php echo $source_wise_data; ?>,
                        fill: true,
                        categoryPercentage: 0.3,
                        borderColor: '#00B493',
                        backgroundColor: '#00B493',
                        borderWidth: 2
                    }]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return data['labels'][tooltipItem[0]['index']];
                        },
                        label: function (tooltipItem, data) {
                            return "<?php echo app_lang('converted_to_client'); ?>:" + data['datasets'][0]['data'][tooltipItem['index']];
                        }
                    }
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                display: true
                            }
                        }],
                    yAxes: [{
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                display: true
                            }
                        }]
                }
            }
        });



    });
</script>    

