<template>
  <v-container>
    <v-divider class="mt-4 mb-12"></v-divider>
    <v-select
      :items="data"
      :item-text="'sprint'"
      v-model="sprintSelected"
      @change="changeSprintInfo"
      return-object
    ></v-select>
    <h4 align="left" style="padding: 20px 0px">
      Sprint goal: {{ sprintSelected.goal }}
    </h4>
    <h4 align="left" style="padding: 20px 0px 0px 0px">Burndown Chart:</h4>
    <ve-line
      :legend-visible="false"
      :data="chartData"
      :settings="chartSettings"
      :colors="colors"
      :extend="chartExtends"
      :tooltip="chartDataTooltip"
      :grid="grid"
    ></ve-line>
    <v-data-table
      :headers="headers"
      :items="issues"
      :items-per-page="5"
      @change="issueSelected"
      class="elevation-1"
    >
      <template v-slot:[`item.status`]="{ item }">
        <v-chip :class="getColor(item.status)">
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { getSprintInfo, getIssueInfo, getBurndownChart } from "@/apis/jiraInfo";

interface SelectedSprint {
  id: number;
  sprint: string;
  goal: string;
}

interface ChartDataRows {
  Date: string;
  Point: string;
  Expect: string;
}

export default Vue.extend({
  data() {
    return {
      grid: { right: 20 }, // x坐標軸顯示完整文字
      headers: [
        { text: "Name", value: "name" },
        { text: "Status", value: "status" },
        { text: "Point", value: "point" }
      ],
      sprintSelected: {} as SelectedSprint,
      issueSelected: {},
      chartData: {
        columns: ["Date", "Expect", "Point"],
        rows: [] as ChartDataRows[]
      },
      chartSettings: {
        yAxisName: ["Point"], // y軸名稱
        dimension: ["Date"],
        xAxisType: "time"
      },
      chartDataTooltip: {
        formatter: function(params: { data: any; marker: any }) {
          return `${params.data[0]}<br>${params.marker} Point : ${params.data[1]}`;
        }
      },
      chartExtends: {
        xAxis: {
          // x軸配置
          axisLabel: {
            interval: 0 // x軸資料分割間隔,0 為全部展示
          }
        },
        series: {
          smooth: false,
          connectNulls: true
        }
      },
      colors: ["#B3BAC5", "#DE350B"], // 圖表顏色
      data: [] as SelectedSprint[],
      issues: [] as object[]
    };
  },
  methods: {
    getAllSprint() {
      getSprintInfo(Number(this.$route.params.repoId))
        .then(response => {
          response.data.result.forEach((item: any) => {
            this.data.push({
              sprint: item.name,
              goal: item.goal,
              id: item.id
            });
          });
          this.data.reverse();
          this.sprintSelected = this.data[0];
          this.changeSprintInfo();
        })
        .catch(err => {
          alert("系統錯誤");
        });
    },
    changeSprintInfo() {
      getBurndownChart(
        Number(this.$route.params.repoId),
        this.sprintSelected.id
      ).then(response => {
        this.chartData.rows = [];
        response.data.result.forEach((item: any) => {
          this.chartData.rows.push({
            Date: item.date,
            Point: item.storyPoint,
            Expect: ""
          });
        });
        this.chartData.rows[0].Expect = this.chartData.rows[0].Point;
        this.chartData.rows[this.chartData.rows.length - 1].Expect = "0";
        this.chartData.rows[this.chartData.rows.length - 1].Point = "";
      });
      getIssueInfo(Number(this.$route.params.repoId), this.sprintSelected.id)
        .then(response => {
          this.issues = [];
          response.data.result.forEach((item: any) => {
            this.issues.push({
              name: item.summary,
              status: item.status,
              point: item.estimatePoint
            });
          });
          this.issues.reverse();
        })
        .catch(err => {
          alert("系統錯誤");
        });
    },
    getColor(status: string) {
      if (status == "In Progress")
        return "blue lighten-4 blue--text text--darken-4";
      else if (status == "To Do")
        return "grey lighten-2 grey--text text--darken-3";
      else return "green lighten-4 green--text text--darken-4";
    }
  },
  mounted() {
    this.getAllSprint();
  }
});
</script>

<style lang="scss"></style>
