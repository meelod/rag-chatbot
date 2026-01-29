/**
 * Mock response generator for testing without OpenAI API
 * Used when API key is invalid, quota exceeded, or USE_MOCK_MODE=true
 */

function generateMockResponse(userMessage, conversationHistory) {
    const lowerMessage = userMessage.toLowerCase();

    // Part installation queries
    if (lowerMessage.includes('install') && lowerMessage.includes('ps11752778')) {
        return `To install part number PS11752778, follow these steps:

1. **Safety First**: Unplug your appliance from the electrical outlet.

2. **Locate the Part**: PS11752778 is typically located in the [component area]. Remove any covers or panels as needed.

3. **Remove Old Part**: Carefully disconnect the old part, noting the connection points and orientation.

4. **Install New Part**: Align the new part correctly and reconnect all connections securely.

5. **Test**: Plug the appliance back in and test the functionality.

For detailed installation instructions with diagrams, please visit the PartSelect product page for PS11752778 or consult your appliance's service manual.`;
    }

    // Compatibility queries
    if (lowerMessage.includes('compatible') || lowerMessage.includes('wdt780saem1')) {
        return `To check if a part is compatible with your WDT780SAEM1 model:

1. **Verify Model Number**: Confirm your appliance model number is WDT780SAEM1 (this appears to be a Whirlpool dishwasher model).

2. **Check Part Compatibility**: When searching for parts on PartSelect, you can filter by your specific model number to see only compatible parts.

3. **Part Number Lookup**: If you have a specific part number, you can check its compatibility list on the product page, which will show all compatible model numbers.

Would you like me to help you find a specific part for your WDT780SAEM1 model?`;
    }

    // Troubleshooting queries
    if (lowerMessage.includes('ice maker') || lowerMessage.includes('not working') || lowerMessage.includes('whirlpool')) {
        return `For a Whirlpool refrigerator with a non-working ice maker, here are common solutions:

**Common Causes & Solutions:**

1. **Water Supply Issue**
   - Check if the water line is connected and the shut-off valve is open
   - Verify water pressure is adequate

2. **Clogged Water Filter**
   - Replace the water filter (typically every 6 months)
   - Part numbers vary by model

3. **Frozen Water Line**
   - Check for ice blockages in the water line
   - May need to defrost the freezer

4. **Faulty Ice Maker Assembly**
   - May need to replace the ice maker assembly
   - Common part: varies by model number

**Next Steps:**
To get the exact part numbers for your specific Whirlpool refrigerator model, please provide your complete model number. I can then help you find the right replacement parts on PartSelect.`;
    }

    // Out of scope detection
    if (!lowerMessage.includes('refrigerator') && !lowerMessage.includes('dishwasher') &&
        !lowerMessage.includes('part') && !lowerMessage.includes('appliance') &&
        !lowerMessage.includes('install') && !lowerMessage.includes('compatible') &&
        !lowerMessage.includes('repair') && !lowerMessage.includes('fix')) {
        return `I specialize in helping with refrigerator and dishwasher parts, compatibility, installation, and troubleshooting. 

How can I assist you with parts for these appliances today? For example, I can help you:
- Find compatible parts for your appliance model
- Provide installation guidance
- Troubleshoot common issues
- Check part availability`;
    }

    // Default helpful response
    return `I'd be happy to help you with refrigerator and dishwasher parts! 

To provide the most accurate assistance, could you please share:
- Your appliance brand and model number
- The specific part you're looking for (if you have a part number)
- What you're trying to accomplish (installation, repair, replacement, etc.)

For example: "I need a water filter for my Whirlpool WDT780SAEM1 dishwasher" or "How do I install part PS11752778?"`;
}

module.exports = {
    generateMockResponse
};
