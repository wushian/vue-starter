<template>
  <div :class="$style.calendar">
    <div :class="$style.header">
      <h3 @click="setSelecting('year')">{{ selectedYear }}</h3>
      <h2 @click="setSelecting('date')">{{ abbrivatedDay }}, {{ selectedMonthWord }} {{ selectedDay }}</h2>
    </div>

    <div :class="$style.body" v-if="selecting === 'date'">
      <div :class="$style.date">
        <div :class="$style.arrow" @click="setByMonth(currentMonth - 1)" v-if="showLeftArrow"></div>
        <div :class="$style.currentDate">{{ currentMonthWord }} {{ currentYear }}</div>
        <div :class="$style.arrow" @click="setByMonth(currentMonth + 1)" v-if="showRightArrow"></div>
      </div>
      <table>
        <thead>
        <tr>
          <td><span>S</span></td>
          <td><span>M</span></td>
          <td><span>T</span></td>
          <td><span>W</span></td>
          <td><span>T</span></td>
          <td><span>F</span></td>
          <td><span>S</span></td>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(days, index) in calendar" :key="index">
          <td :class="[day.currentDay ? $style.currentDay : '', day.disabled ? $style.disabled : '', day.selected ? $style.selectedDay : '']"
            v-for="day in days"
            :key="`day-${day.day}`"
            tabindex="0"
            @keydown.enter="onInput"
            @keydown.space.stop.prevent="onInput"
            @keydown.esc="onClose"
            @click="setByDay(day)">
            <span>{{ day.day }}</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div :class="$style.year" v-if="selecting === 'year'">
      <div :class="[year.selected ? $style.selected : '']"
        :id="`${year.year}-calendar-year`"
        v-for="year in years"
        :key="year.year"
        @click="setByYear(year.year)">
        {{ year.year }}
      </div>
    </div>

    <div :class="$style.footer">
      <vue-button @click.stop.prevent="onClose" accent>Cancel</vue-button>
      <vue-button @click.stop.prevent="onInput" primary>Ok</vue-button>
    </div>
  </div>
</template>

<script lang="ts">
  import VueButton from '../VueButton/VueButton.vue';

  const slice = (array: any[], start: number, end: number) => {
    let length = array == null ? 0 : array.length;

    if (!length) {
      return [];
    }

    start = start == null ? 0 : start;

    end = end === undefined ? length : end;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }

    end = end > length ? length : end;

    if (end < 0) {
      end += length;
    }

    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    let index = -1;

    const result = new Array(length);

    while (++index < length) {
      result[index] = array[index + start];
    }

    return result;
  };
  const chunk = (array: any[], size: number) => {
    size = Math.max(size, 0);

    const length = array == null ? 0 : array.length;

    if (!length || size < 1) {
      return [];
    }

    let index = 0;

    let resIndex = 0;

    const result = new Array(Math.ceil(length / size));

    while (index < length) {
      result[resIndex++] = slice(array, index, (index += size));
    }

    return result;
  };

  interface IDay {
    day: number;
    currentDay: boolean;
    selected: boolean;
    disabled: boolean;
  }

  interface IYear {
    year: number;
    selected: boolean;
  }

  export default {
    name: 'VueDatePicker',
    components: {
      VueButton
    },
    props: {
      color: {
        type: String,
        required: false,
        default: '#009688'
      },

      format: {
        type: Function,
        required: false
      },

      min: {
        type: String,
        required: false
      },

      max: {
        type: String,
        required: false
      },

      value: {
        type: String,
        required: false
      },

      footer: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    computed: {
      initialDate(): boolean {
        return !!(this.value || this.min);
      },
      specifiedDate(): Date {
        return new Date(this.value);
      },
      calculatedDate(): string {
        const day = this.selectedDay >= 10 ? this.selectedDay : `0${this.selectedDay}`;

        const month = this.selectedMonth + 1 >= 10 ? this.selectedMonth + 1 : `0${this.selectedMonth + 1}`;

        return `${this.selectedYear}-${month}-${day}`;
      },
      abbrivatedDay(): string {
        return this.dayMap[this.selectedDayOfWeek];
      },
      currentMonthWord(): string {
        return this.monthMap[this.currentMonth];
      },
      selectedMonthWord(): string {
        return this.monthMap[this.selectedMonth];
      },
      minDate(): Date {
        if (this.min) {
          const minDateSplit = this.min.split('-');

          return new Date(minDateSplit[0], minDateSplit[1], minDateSplit[2]);
        }
      },
      maxDate(): Date {
        if (this.max) {
          const maxDateSplit = this.max.split('-');

          return new Date(maxDateSplit[0], maxDateSplit[1], maxDateSplit[2]);
        }
      },
      showLeftArrow(): boolean {
        if (!this.min) return true;

        if (this.minDate.getFullYear() === this.currentYear &&
          this.minDate.getMonth() - 1 === this.currentMonth) {
          return false;
        }

        return true;
      },
      showRightArrow(): boolean {
        if (!this.max) return true;

        if (this.maxDate.getFullYear() === this.currentYear &&
          this.maxDate.getMonth() - 1 === this.currentMonth) {
          return false;
        }

        return true;
      },
      calendar(): IDay[] {
        let days: number[] = [];

        const paddingLeft = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = 32 - new Date(this.currentYear, this.currentMonth, 32).getDate();
        const today = new Date();

        days = days.concat(Array(paddingLeft).fill(null));

        for (let i = 0, len = daysInMonth; i < daysInMonth; i++) {
          days.push(i + 1);
        }

        const paddingRight = (Math.ceil(days.length / 7) * 7) - days.length;

        days = days.concat(Array(paddingRight).fill(null));

        const dayObjects: IDay[] = days.map((day): IDay => {
          const currentDay = (day === today.getDate()) &&
            (this.currentMonth === today.getMonth()) &&
            (this.currentYear === today.getFullYear());

          const selected = (this.selectedDay === day) &&
            (this.currentMonth === this.selectedMonth) &&
            (this.currentYear === this.selectedYear);

          const disabled: boolean = this.dayDisabled(day);

          return { day, currentDay, selected, disabled } as IDay;
        });

        return chunk(dayObjects, 7);
      },
      years(): IYear[] {
        let firstYear;

        if (this.min) {
          firstYear = this.minDate.getFullYear();
        } else if (this.value) {
          firstYear = this.specifiedDate.getFullYear();
        } else {
          firstYear = (new Date).getFullYear();
        }

        let through = this.max ? (this.maxDate.getFullYear() + 1) - firstYear : 101;

        let years = [];

        for (let i = firstYear, len = firstYear + through; i < len; i++) {
          years.push(i);
        }

        return years.map((year) => {
          return { year, selected: year === this.selectedYear } as IYear;
        });
      }
    },
    created() {
      this.setDate();
      this.setEscapeEvent();
    },
    data() {
      return {
        selecting: 'date',
        currentMonth: '',
        currentYear: '',
        selectedDayOfWeek: '',
        selectedDay: '',
        selectedMonth: '',
        selectedYear: '',
        dayMap: {
          0: 'Sun',
          1: 'Mon',
          2: 'Tue',
          3: 'Wed',
          4: 'Thu',
          5: 'Fri',
          6: 'Sat'
        },
        monthMap: {
          0: 'January',
          1: 'February',
          2: 'March',
          3: 'April',
          4: 'May',
          5: 'June',
          6: 'July',
          7: 'August',
          8: 'September',
          9: 'October',
          10: 'November',
          11: 'December'
        }
      };
    },
    methods: {
      setSelecting(value: string): void {
        this.selecting = value;
      },
      setByDay(day: any): void {
        if (day.disabled) {
          return;
        }

        this.selectedYear = this.currentYear;
        this.selectedDay = day.day;
        this.selectedMonth = this.currentMonth;
        this.selectedDayOfWeek = new Date(this.selectedYear, this.selectedMonth, day.day).getDay();

        if (this.footer) {
          this.onInput();
        }
      },
      setByMonth(month: number): void {
        if (month === 12) {
          this.currentYear = this.currentYear + 1;
          this.currentMonth = 0;

          return;
        }

        if (month === -1) {
          this.currentYear = this.currentYear - 1;
          this.currentMonth = 11;

          return;
        }

        this.currentMonth = month;
      },
      setByYear(year: number): void {
        this.selectedYear = year;
        this.currentYear = year;
        this.selecting = 'date';
      },
      setDate(): void {
        let date;

        if (this.min && this.min && !this.value) {
          date = new Date(this.min);
        } else if (this.value && this.value) {
          date = new Date(this.value);
        } else {
          date = new Date();
        }

        if (this.initialDate) {
          this.selectedDay = date.getDate() + 1;
        } else {
          this.selectedDay = date.getDate();
        }

        this.selectedDayOfWeek = date.getDay();
        this.selectedMonth = date.getMonth();
        this.currentMonth = date.getMonth();
        this.selectedYear = date.getFullYear();
        this.currentYear = date.getFullYear();
      },
      dayDisabled(day: number): boolean {
        if (this.min &&
          (this.minDate.getMonth() - 1 === this.currentMonth &&
            this.minDate.getFullYear() === this.currentYear) &&
          day < this.minDate.getDate()) {
          return true;
        }

        if (this.max &&
          (this.maxDate.getMonth() - 1 === this.currentMonth &&
            this.maxDate.getFullYear() === this.currentYear) &&
          day > this.maxDate.getDate()) {
          return true;
        }

        return false;
      },
      setEscapeEvent(): void {
        if (typeof document === 'undefined') {
          return;
        }

        document.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.keyCode == 27 || event.key == 'Escape') {
            this.onClose();
          }
        });
      },
      onInput(): void {
        const date = this.format ? this.format(this.calculatedDate) : this.calculatedDate;

        this.$emit('input', date);
        this.onClose();
      },
      onClose(): void {
        this.$emit('close');
      }
    }
  };
</script>

<style lang="scss" module>
  @import "../../styles";

  .calendar {
    max-width:  $screen-phone;
    position:   relative;
    box-shadow: $panel-shadow;
    background: $panel-bg;
    margin:     0 0 $grid-unit * 2;
  }

  .header {
    color:       $text-color;
    padding:     $grid-unit * 2 $grid-unit * 3;
    background:  linear-gradient(170deg, $brand-accent 0%, $brand-dark-primary 100%);
    text-shadow: 0 2px 5px rgba(0, 0, 0, .33);

    h2, h3 {
      cursor: default;
      margin: 0;
    }

    h2 {
      font-size:   $font-size-h4;
      line-height: $font-size-h4;
    }

    h3 {
      font-size:   $font-size-h6;
      font-weight: 300;
      cursor:      pointer;
    }
  }

  .body {
    border-bottom: $accordion-item-header-border-top;
    padding:       $grid-unit * 2;

    table {
      display: block;

      thead, tbody {
        display: block;
      }

      tr {
        display:   flex;
        flex-wrap: wrap;

        td {
          &:before {
            content:     "";
            float:       left;
            padding-top: 100%;
          }
          border-radius: 50%;
          flex:          1;
          text-align:    center;

          &:hover {
            background: $bg-color;
            cursor:     pointer;
          }

          span {
            position: relative;
            top:      23%;
          }
        }
      }
    }
  }

  .date {
    display: flex;
  }

  .arrow {
    height:   $grid-unit * 4;
    flex:     1 0 15%;
    position: relative;
    cursor:   pointer;

    &:hover {
      background: $bg-color;
    }

    &:before, &:after {
      content:          "";
      transition:       all 0.25s ease-in-out;
      position:         absolute;
      background-color: $brand-accent;
      width:            2px;
      height:           13px;
      top:              4px;
      left:             $grid-unit * 2;
    }

    &:before {
      transform: translate(4px, 0) rotate(45deg);
    }

    &:after {
      transform: translate(4px, 8px) rotate(135deg);
    }

    &:last-child {
      text-align: right;

      &:before, &:after {
        right: $grid-unit * 3;
        left:  initial;
      }

      &:before {
        transform: translate(4px, 0) rotate(-45deg);
      }

      &:after {
        transform: translate(4px, 8px) rotate(-135deg);
      }
    }
  }

  .currentDate {
    cursor:      default;
    text-align:  center;
    flex:        1 0 70%;
    font-size:   14px;
    font-weight: 500;
    padding-top: $grid-unit * 0.5;
  }

  .currentDay {
    font-weight:      bold;
    background-color: $brand-primary;
    color:            $bg-color;

    &:hover {
      background-color: $brand-primary !important;
    }
  }

  .selectedDay {
    font-weight:      bold;
    background-color: $brand-accent;
    color:            $bg-color;

    &:hover {
      background-color: $brand-accent !important;
    }
  }

  .year {
    box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.075);
    max-height: 312px;
    overflow-y: scroll;
    text-align: center;

    div {
      cursor:     pointer;
      padding:    $grid-unit 0;
      transition: background-color .15s;

      &:hover {
        background-color: $bg-color;
      }
    }

    .selected {
      font-size: $font-size-h4;
    }
  }

  .footer {
    padding:         $grid-unit;
    display:         flex;
    justify-content: flex-end;

    button {
      margin-bottom: 0;

      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>
