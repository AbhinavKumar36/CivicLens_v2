export class NormalizationEngine {
  /**
   * Normalizes raw citizen input (text/voice/multimodal) into a structured civic development demand.
   * Extracts the citizen's actual problem and civic need WITHOUT inventing engineering interventions.
   * Supports English, Odia, and Hindi.
   * @param {Object} input - { text, category, ward, lat, lng, citizenId, language }
   */
  static normalize(input) {
    const rawText = (input.text || input.summary || '').trim();
    const lower = rawText.toLowerCase();

    // 1. Language Detection (Odia, Hindi, English)
    let language = input.language || 'English';
    const isOdia = /[\u0B00-\u0B7F]/.test(rawText);
    const isHindi = /[\u0900-\u097F]/.test(rawText);
    if (isOdia) language = 'Odia';
    else if (isHindi) language = 'Hindi';

    // 2. Ward and Location Entity Detection in Bhubaneswar
    let detectedWard = input.ward || input.ward_id || null;
    let lat = input.lat || null;
    let lng = input.lng || null;

    if (!detectedWard) {
      if (lower.includes('bhouma nagar') || lower.includes('harish vihar') || lower.includes('ward 23') || lower.includes('23')) {
        detectedWard = 'Ward 23';
        lat = 20.2785;
        lng = 85.8324;
      } else if (lower.includes('rasulgarh') || lower.includes('ward 35') || lower.includes('35')) {
        detectedWard = 'Ward 35';
        lat = 20.2961;
        lng = 85.8712;
      } else if (lower.includes('saheed nagar') || lower.includes('ward 24') || lower.includes('24')) {
        detectedWard = 'Ward 24';
        lat = 20.2882;
        lng = 85.8501;
      } else if (lower.includes('nayapalli') || lower.includes('ward 42') || lower.includes('42')) {
        detectedWard = 'Ward 42';
        lat = 20.3015;
        lng = 85.8152;
      } else if (lower.includes('chandrasekharpur') || lower.includes('ward 12') || lower.includes('12')) {
        detectedWard = 'Ward 12';
        lat = 20.3245;
        lng = 85.8189;
      } else if (lower.includes('old town') || lower.includes('ward 58') || lower.includes('58')) {
        detectedWard = 'Ward 58';
        lat = 20.2415;
        lng = 85.8335;
      } else {
        detectedWard = 'Ward 23';
        lat = 20.2785;
        lng = 85.8324;
      }
    }

    // 3. Problem & Demand Extraction (Extracting citizen problem, NOT prescribing civil engineering solutions)
    let category = 'INFRASTRUCTURE';
    let subCategory = 'General Civic Needs';
    let title = 'Civic Infrastructure Improvement';
    let problemStatement = rawText || 'Infrastructure deficiency reported by citizen.';
    let demandStatement = `Public infrastructure repair and enhancement in ${detectedWard}.`;
    let severity = 'MEDIUM';
    let urgency = 'MEDIUM';
    let confidence = 0.88;
    let affectedGroups = ['Local Residents', 'Pedestrians'];

    // Drainage / Flooding keywords (English, Odia, Hindi)
    if (
      lower.includes('drain') || lower.includes('flood') || lower.includes('waterlog') ||
      lower.includes('monsoon') || lower.includes('नाला') || lower.includes('बाढ़') ||
      lower.includes('जलभराव') || lower.includes('ଡ୍ରେନ') || lower.includes('ଜଳବନ୍ଦୀ')
    ) {
      category = 'DRAINAGE';
      subCategory = 'Waterlogging & Outflow';
      title = `Stormwater Drainage Need — ${detectedWard}`;
      problemStatement = rawText.length > 20
        ? rawText
        : `Severe seasonal waterlogging and stagnant stormwater accumulating in ${detectedWard}.`;
      demandStatement = `Effective stormwater drainage and runoff mitigation in ${detectedWard}.`;
      severity = lower.includes('danger') || lower.includes('severe') || lower.includes('heavy') ? 'CRITICAL' : 'HIGH';
      urgency = 'HIGH';
      confidence = 0.93;
      affectedGroups = ['Daily Commuters', 'Slum Households', 'Commercial Shopkeepers'];
    }
    // Roads / Potholes keywords
    else if (
      lower.includes('road') || lower.includes('pothole') || lower.includes('tar') ||
      lower.includes('pavement') || lower.includes('footpath') || lower.includes('सड़क') ||
      lower.includes('गड्ढे') || lower.includes('ରାସ୍ତା') || lower.includes('ଖାଲ')
    ) {
      category = 'ROADS';
      subCategory = 'Road Surface & Footpaths';
      title = `Road Surface & Pothole Repair — ${detectedWard}`;
      problemStatement = rawText.length > 20
        ? rawText
        : `Damaged road surfaces and potholes posing pedestrian and vehicle hazards in ${detectedWard}.`;
      demandStatement = `Pothole remediation and accessible pedestrian walkways in ${detectedWard}.`;
      severity = lower.includes('severe') ? 'CRITICAL' : 'HIGH';
      urgency = lower.includes('urgent') || lower.includes('immediate') ? 'HIGH' : 'MEDIUM';
      confidence = 0.91;
      affectedGroups = ['Two-Wheeler Riders', 'Pedestrians', 'School Commuters'];
    }
    // Healthcare keywords
    else if (
      lower.includes('health') || lower.includes('clinic') || lower.includes('hospital') ||
      lower.includes('doctor') || lower.includes('dispensary') || lower.includes('अस्पताल') ||
      lower.includes('दवा') || lower.includes('ଡାକ୍ତରଖାନା') || lower.includes('ଔଷଧ')
    ) {
      category = 'HEALTHCARE';
      subCategory = 'Primary Health Access';
      title = `Local Healthcare Access Need — ${detectedWard}`;
      problemStatement = rawText.length > 20
        ? rawText
        : `Lack of nearby primary health facilities requiring long travel for essential medical care in ${detectedWard}.`;
      demandStatement = `Accessible primary healthcare facilities and emergency first-contact post in ${detectedWard}.`;
      severity = 'CRITICAL';
      urgency = 'HIGH';
      confidence = 0.94;
      affectedGroups = ['Pregnant Women & Infants', 'Elderly Citizens', 'Low-Income Families'];
    }
    // Water keywords
    else if (
      lower.includes('water') || lower.includes('tap') || lower.includes('drinking') ||
      lower.includes('pipeline') || lower.includes('पानी') || lower.includes('नल') ||
      lower.includes('ପାଣି') || lower.includes('ନଳ')
    ) {
      category = 'WATER';
      subCategory = 'Potable Water Access';
      title = `Drinking Water Supply Need — ${detectedWard}`;
      problemStatement = rawText.length > 20
        ? rawText
        : `Contaminated, irregular, or inadequate potable water supply in ${detectedWard}.`;
      demandStatement = `Clean, reliable piped drinking water supply in ${detectedWard}.`;
      severity = lower.includes('contaminat') || lower.includes('dirty') || lower.includes('sick') ? 'CRITICAL' : 'HIGH';
      urgency = 'HIGH';
      confidence = 0.92;
      affectedGroups = ['Slum Dwellers', 'Households', 'Children'];
    }
    // Sanitation & Waste keywords
    else if (
      lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') ||
      lower.includes('dump') || lower.includes('smell') || lower.includes('कचरा') ||
      lower.includes('गंदगी') || lower.includes('ଅଳିଆ')
    ) {
      category = 'SANITATION';
      subCategory = 'Solid Waste Collection';
      title = `Solid Waste Clearance Need — ${detectedWard}`;
      problemStatement = rawText.length > 20
        ? rawText
        : `Uncollected garbage accumulation and roadside waste dumping in ${detectedWard}.`;
      demandStatement = `Regular solid waste collection and community cleanliness in ${detectedWard}.`;
      severity = 'MEDIUM';
      urgency = 'HIGH';
      confidence = 0.89;
      affectedGroups = ['Neighborhood Residents', 'Sanitation Staff', 'School Children'];
    }

    // Global Emergency Keyword Detection
    if (
      lower.includes('fire') || lower.includes('accident') || lower.includes('emergency') || 
      lower.includes('help') || lower.includes('sos') || lower.includes('आग') || 
      lower.includes('दुर्घटना') || lower.includes('ନିଆଁ')
    ) {
      category = 'EMERGENCY';
      subCategory = 'Urgent Dispatch Required';
      title = `EMERGENCY ALERT — ${detectedWard}`;
      severity = 'EMERGENCY_SOS';
      urgency = 'IMMEDIATE';
      confidence = 1.0;
    }

    return {
      category,
      subCategory,
      title,
      summary: rawText.length > 90 ? `${rawText.substring(0, 87)}...` : rawText,
      demandStatement,
      problemStatement,
      affectedGroups,
      severity,
      urgency,
      language,
      wardId: detectedWard,
      lat: lat || 20.2785,
      lng: lng || 85.8324,
      confidence,
      citizenId: input.citizenId || input.citizen_id || 'ANONYMOUS_CITIZEN',
      source: input.source || 'CITIZEN_REPORT',
      createdAt: new Date().toISOString()
    };
  }
}

