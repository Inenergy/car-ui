<script>
  import { driveMode, rpm } from '../stores';
  import { GROUND_RESISTANCE, __ } from '../../constants';
  let resistance;
  driveMode.subscribe((res) => (resistance = GROUND_RESISTANCE[res].label));
</script>

<footer>
  <div>
    <span>{__('ground type')}:</span>
    <strong>{resistance.toLowerCase()}</strong>
  </div>
  <div>
    <span>{__('rpm')}: </span>
    <strong>{$rpm}</strong>
  </div>
</footer>

<style>
  footer {
    display: flex;
    height: 5rem;
    line-height: 5rem;
    font-size: 1.6rem;
    padding: 0 3.6rem;
    justify-content: space-between;
  }

  div {
    width: 40%;
    white-space: nowrap;
  }
</style>
