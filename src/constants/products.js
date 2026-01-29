/**
 * Sample product data for fallback when scraping fails or is disabled
 * In production, this would come from scraping or API
 */

const SAMPLE_PRODUCTS = [
   {
      id: "ps11752778",
      partNumber: "PS11752778",
      name: "Ice Maker Assembly",
      description: "Complete ice maker assembly for Whirlpool refrigerators. Includes ice maker unit, water fill tube, and mounting hardware. Compatible with select Whirlpool refrigerator models.",
      category: "Refrigerator - Ice Maker",
      brand: "Whirlpool",
      compatibleModels: ["WRX735SDHZ", "WRF540CWHZ", "WRF540CWHZ00", "WRS325FDAM"],
      installation: `Installation Steps for PS11752778 (Ice Maker Assembly):

1. **Safety First**: Unplug the refrigerator from the electrical outlet.

2. **Locate the Ice Maker**: The ice maker is typically located in the freezer compartment, on the left or right side wall.

3. **Remove Old Ice Maker**:
   - Remove any ice from the ice bin
   - Locate the mounting screws (usually 2-3 screws)
   - Disconnect the electrical connector
   - Disconnect the water fill tube
   - Carefully remove the old ice maker

4. **Install New Ice Maker**:
   - Position the new ice maker assembly in place
   - Connect the water fill tube securely
   - Connect the electrical connector
   - Secure with mounting screws (don't overtighten)

5. **Reconnect Power**: Plug the refrigerator back in

6. **Test**: Allow 24 hours for ice production. The first batch may take longer.

**Required Tools**: Phillips screwdriver, possibly a 1/4" nut driver

**Note**: If your model uses a different mounting system, refer to your appliance's service manual.`,
      troubleshooting: `If your ice maker isn't working, check:
- Water supply line is connected and not frozen
- Ice maker switch is in the "on" position
- Water filter is not clogged (replace if over 6 months old)
- Freezer temperature is at 0°F or below
- No ice buildup blocking the mechanism`,
      price: "$89.99",
      inStock: true
   },
   {
      id: "wdt780saem1_door_gasket",
      partNumber: "WPW10206335",
      name: "Dishwasher Door Gasket",
      description: "Door gasket seal for Whirlpool dishwasher model WDT780SAEM1. This gasket prevents water leaks around the dishwasher door. Made of durable rubber material.",
      category: "Dishwasher - Door Seal",
      brand: "Whirlpool",
      compatibleModels: ["WDT780SAEM1", "WDT780SAEM0", "WDT780SAEM2"],
      installation: `Installation Steps for Door Gasket (WPW10206335):

1. **Safety First**: Turn off the dishwasher and disconnect power at the circuit breaker.

2. **Remove Old Gasket**:
   - Open the dishwasher door
   - Locate the gasket around the door opening
   - Starting at one corner, carefully pull the gasket out of its channel
   - Work your way around the entire perimeter

3. **Clean the Channel**: 
   - Remove any old adhesive or debris from the gasket channel
   - Clean with mild soap and water, then dry thoroughly

4. **Install New Gasket**:
   - Start at the top center of the door opening
   - Press the gasket into the channel, working around the perimeter
   - Ensure the gasket is fully seated in the channel
   - Check for any gaps or bulges

5. **Test**: Run a test cycle to ensure no leaks

**Required Tools**: None (installation by hand)

**Note**: Make sure the gasket is not twisted or kinked during installation.`,
      troubleshooting: `If your dishwasher is leaking from the door:
- Check if the gasket is properly seated in the channel
- Look for cracks or tears in the gasket
- Ensure the door is closing properly and latching
- Check that the dishwasher is level`,
      price: "$24.99",
      inStock: true
   },
   {
      id: "refrigerator_water_filter",
      partNumber: "PS11752778-FILTER",
      name: "Refrigerator Water Filter",
      description: "Replacement water filter for Whirlpool refrigerators. Reduces chlorine taste and odor, sediment, and other contaminants. Should be replaced every 6 months or 200 gallons.",
      category: "Refrigerator - Water Filter",
      brand: "Whirlpool",
      compatibleModels: ["WRX735SDHZ", "WRF540CWHZ", "WRS325FDAM", "WRT318FZDM"],
      installation: `Installation Steps for Water Filter:

1. **Locate Filter**: The filter is typically located in the top right corner of the refrigerator compartment or in the grille at the bottom.

2. **Remove Old Filter**:
   - Turn the filter counterclockwise (usually 1/4 turn)
   - Pull straight out
   - Some water may drip - have a towel ready

3. **Install New Filter**:
   - Remove protective cap from new filter
   - Insert filter into housing
   - Turn clockwise until it clicks into place
   - Don't overtighten

4. **Flush System**:
   - Run 2-3 gallons of water through the dispenser
   - Discard the first few batches of ice

**Required Tools**: None

**Note**: The filter housing may have an arrow indicating rotation direction.`,
      troubleshooting: `If water/ice tastes bad or flow is slow:
- Check if filter needs replacement (6 months or 200 gallons)
- Ensure filter is properly installed and seated
- Flush the system after installation
- Check water supply line for kinks or blockages`,
      price: "$34.99",
      inStock: true
   },
   {
      id: "dishwasher_pump",
      partNumber: "WPW10206336",
      name: "Dishwasher Drain Pump",
      description: "Drain pump assembly for Whirlpool dishwashers. Responsible for pumping water out of the dishwasher during drain cycles. If your dishwasher won't drain, this part may need replacement.",
      category: "Dishwasher - Pump",
      brand: "Whirlpool",
      compatibleModels: ["WDT780SAEM1", "WDT780SAEM0", "WDF540PADM"],
      installation: `Installation Steps for Drain Pump (WPW10206336):

1. **Safety First**: Disconnect power at the circuit breaker.

2. **Access the Pump**:
   - Remove the bottom dish rack
   - Remove the lower spray arm
   - Remove the filter assembly
   - You should now see the pump assembly

3. **Remove Old Pump**:
   - Disconnect the drain hose from the pump
   - Disconnect electrical connectors
   - Remove mounting screws/clips
   - Remove the old pump

4. **Install New Pump**:
   - Position new pump in place
   - Secure with mounting screws
   - Reconnect electrical connectors
   - Reconnect drain hose (ensure tight connection)

5. **Reassemble**: Replace filter, spray arm, and dish rack

6. **Test**: Run a test cycle to ensure proper draining

**Required Tools**: Phillips screwdriver, pliers, possibly a 5/16" nut driver

**Warning**: This is a more complex repair. If unsure, consider professional installation.`,
      troubleshooting: `If dishwasher won't drain:
- Check for clogs in the drain hose
- Inspect the pump impeller for debris
- Listen for pump motor running (if silent, pump may be faulty)
- Check for error codes on the display
- Ensure drain hose is not kinked or blocked`,
      price: "$129.99",
      inStock: true
   },
   {
      id: "refrigerator_door_seal",
      partNumber: "WPW10206337",
      name: "Refrigerator Door Gasket",
      description: "Door gasket seal for refrigerator doors. Prevents cold air from escaping and warm air from entering. If your refrigerator is running constantly or not cooling properly, a damaged gasket may be the cause.",
      category: "Refrigerator - Door Seal",
      brand: "Whirlpool",
      compatibleModels: ["WRX735SDHZ", "WRF540CWHZ", "WRS325FDAM"],
      installation: `Installation Steps for Door Gasket (WPW10206337):

1. **Safety First**: Unplug the refrigerator.

2. **Remove Old Gasket**:
   - Open the door
   - The gasket is held in place by a retainer strip
   - Starting at one corner, carefully pull the gasket out from under the retainer
   - Work your way around the entire door perimeter

3. **Clean the Retainer Channel**:
   - Remove any old adhesive or debris
   - Clean with mild soap and water, then dry

4. **Install New Gasket**:
   - Start at the top center of the door
   - Tuck the gasket edge under the retainer strip
   - Work around the perimeter, ensuring it's fully seated
   - Check corners are properly fitted

5. **Test Seal**:
   - Close the door
   - Try to pull a dollar bill between the door and frame - it should have resistance
   - If it slides out easily, the gasket may need adjustment

**Required Tools**: None (installation by hand)

**Note**: The gasket may need to "relax" for 24 hours after installation.`,
      troubleshooting: `If refrigerator isn't cooling properly:
- Check if gasket is sealing properly (dollar bill test)
- Look for cracks, tears, or gaps in the gasket
- Ensure door is closing properly and level
- Check if gasket is warped or deformed`,
      price: "$49.99",
      inStock: true
   }
];

module.exports = {
   SAMPLE_PRODUCTS
};
