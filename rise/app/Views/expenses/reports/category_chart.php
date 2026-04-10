<div class="card-body ">
    <canvas id="expense-category-chart" style="width:100%; height: 350px;"></canvas>
</div>

<script type="text/javascript">
    initExpenseCategoryChart = function (labels, data) {
        var colorPlate = [
            '#14BAA0', '#FF3D67', '#3B81F6', '#6165F2', '#F59F0F', '#FBCD16', '#E84C3D', '#40E0D0', '#E67F22',
            '#36A2EB', '#FF6283', '#4BC0C0', '#FF9F40', '#32CD32', '#9370DB', '#FFD700', '#008080', '#FF6347', '#7B68EE',
            '#40E0D0', '#FF4500', '#6A5ACD', '#00FF7F', '#8B008B', '#FF8C00', '#00CED1', '#FF69B4', '#48D1CC', '#FF1493',
            '#1E90FF', '#ADFF2F', '#8A2BE2', '#00FF00', '#9932CC', '#228B22', '#BA55D3', '#3CB371', '#800000', '#7FFFD4',
            '#8B0000', '#00FFFF', '#DC143C', '#00FF8C', '#FF0000', '#7FFF00', '#B22222', '#00FA9A', '#FF7F50', '#ADFF2F',
            '#8B4513', '#20B2AA', '#CD5C5C', '#98FB98', '#800080', '#66CDAA', '#FA8072', '#9ACD32', '#FF4500', '#8FBC8B'
        ];

        var color = data.length <= 50 ? colorPlate.slice(0, data.length) : generateColors(data.length);

        var expenseCategoryChart = document.getElementById("expense-category-chart");

        new Chart(expenseCategoryChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: color,
                        borderWidth: 0
                    }]
            },
            options: {
                cutoutPercentage: 60,
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItems, data) {
                            if (tooltipItems) {
                                return " " + data.labels[tooltipItems.index];
                            } else {
                                return false;
                            }
                        },
                        afterLabel: function (tooltipItem, data) {
                            var dataset = data['datasets'][0];
                            var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][Object.keys(dataset["_meta"])[0]]['total']) * 100);
                            return " " + toCurrency(dataset['data'][tooltipItem['index']]) + ' (' + percent + '%)';
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
                animation: {
                    animateScale: true
                }
            }
        });
    };

    // generate random color
    function generateColors(count) {
        var colors = [];

        for (var i = 0; i < count; i++) {
            var color = '#' + Math.floor(Math.random() * 12345678).toString(16);
            colors.push(color);
        }
        return colors;
    }

    $(document).ready(function () {
        initExpenseCategoryChart(<?php echo json_encode($label) ?>, <?php echo json_encode($data) ?>);
    });
</script>