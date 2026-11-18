import fitz # PyMuPDF

def create_manual_pdf(filename="public/Borderland_Trails_Technical_Puzzle_Manual.pdf"):
    doc = fitz.open()

    # Pages content specification
    # We will build 6 pages of clean, professional manual
    pages_data = [
        # Page 1
        {
            "header": "Borderland Trails\nTechnical Puzzle Manual\n20 technical challenges and their operating instructions",
            "items": [
                {
                    "title": "1. The Reversed Processor",
                    "prompt": "A processor receives the following 8-bit instruction. Apply the correct processor procedure and report the final 8-bit output.",
                    "code": "INPUT = 11001011",
                    "rules": [
                        "For an 8-bit word, use the full-word reversal procedure. Reverse all eight positions before performing any other operation.",
                        "After reversal, invert every bit: 0 becomes 1 and 1 becomes 0.",
                        "Split the result into two 4-bit nibbles. Exchange the left and right nibbles, preserving the order inside each nibble.",
                        "For a 4-bit word, reverse the four positions, complement the result, and do not perform a nibble exchange. For a 16-bit word, divide into four nibbles and exchange the outer pair only.",
                        "The output must contain exactly the same number of bits as the input. Do not remove leading zeroes."
                    ]
                },
                {
                    "title": "2. The Forbidden Gate",
                    "prompt": "Evaluate the circuit from left to right. Report the single output bit.",
                    "code": "A = 1,  B = 0,  C = 1\nA and B enter G1. The output of G1 and C enter G2.",
                    "rules": [
                        "For a 2-input gate, G1 outputs 1 when exactly one input is 1. Otherwise it outputs 0.",
                        "For a 2-input gate, G2 outputs 1 when its two inputs are different. Otherwise it outputs 0.",
                        "If a gate is explicitly marked G3, it accepts three inputs and outputs 1 only when exactly two of the three inputs are 1.",
                        "Evaluate the gate nearest the inputs first. Feed its output into the next gate. Never evaluate all gates simultaneously.",
                        "A small circle on a gate output would mean invert that gate's result. No output circles are shown in this puzzle."
                    ]
                },
                {
                    "title": "3. The Memory Fragment",
                    "prompt": "Execute the instruction sequence using the memory table. Report the final 4-bit result.",
                    "code": "M1 = 1010\nM2 = 1100\nM3 = 0110\nM4 = 1001\nREAD M2\nXOR M4\nAND M1\nNOT RESULT",
                    "rules": [
                        "This task uses 4-bit words. Keep every intermediate result at exactly four bits.",
                        "Compare corresponding positions. Write 1 when the two bits differ; otherwise write 0.",
                        "Compare corresponding positions. Write 1 only when both bits are 1."
                    ]
                }
            ]
        },
        # Page 2
        {
            "header": None,
            "items": [
                {
                    "title": "3. The Memory Fragment (Continued)",
                    "prompt": None,
                    "code": None,
                    "rules": [
                        "Invert each bit in the current result.",
                        "For 8-bit operations, pad shorter values on the left with zeroes before calculation. For 2-bit operations, discard all but the two rightmost bits after each operation.",
                        "READ retrieves a value. Each later operation acts on the current result and the named memory value, unless the instruction explicitly says RESULT."
                    ]
                },
                {
                    "title": "4. The Clock Synchronization Error",
                    "prompt": "Four machines report different times. Use the synchronization procedure to determine the master time.",
                    "code": "A = 10:15\nB = 10:23\nC = 10:11\nD = 10:19",
                    "rules": [
                        "When exactly four clock readings are supplied, sort them, discard the earliest and latest, then average the two remaining readings.",
                        "When exactly three readings are supplied, discard the single reading furthest from the middle value and use the middle value.",
                        "When five readings are supplied, discard the highest and lowest, then average the remaining three.",
                        "If the average contains seconds, round down to the nearest whole minute.",
                        "All readings are on the same day. Do not interpret the values as time zones or convert them to UTC."
                    ]
                },
                {
                    "title": "5. The Corrupted Transmission",
                    "prompt": "Check the received 7-bit word. If the protocol detects an error, apply its correction rule and report the corrected word.",
                    "code": "RECEIVED = 1011000",
                    "rules": [
                        "For a 7-bit word, count all 1s. The total must be even. If it is odd, assume the final bit is corrupted and flip only that bit.",
                        "For an 8-bit word, count all 1s. If the total is odd, flag an error but do not correct it; request retransmission.",
                        "If a packet header explicitly says ODD, the total number of 1s must be odd. Do not apply the even-parity rule to that packet.",
                        "The correction assumption is a simplified event protocol, not a general-purpose error-correction method. Do not attempt to locate arbitrary corrupted bits.",
                        "Preserve all seven positions, including any leading zeroes."
                    ]
                },
                {
                    "title": "6. The Router's Dilemma",
                    "prompt": "Choose the lowest-cost route from A to F. Show the route and its total cost.",
                    "code": "Candidate routes:\nA -> B -> D -> F\nA -> C -> E -> F\nA -> B -> E -> F\nCosts: A-B=4, B-D=3, D-F=5, A-C=2, C-E=4, E-F=2, B-E=1",
                    "rules": [
                        "Add the cost of every link used. The cost of a route is not the number of routers.",
                        "Choose the route with fewer links if two routes have the same total cost. If still tied, choose the route whose next hop comes first alphabetically.",
                        "A route marked HOP mode is judged only by number of links; ignore link costs in that mode.",
                        "A link marked DOWN must not be used even if it produces a lower cost.",
                        "For this puzzle, evaluate only the three candidate routes printed on the question sheet."
                    ]
                }
            ]
        },
        # Page 3
        {
            "header": None,
            "items": [
                {
                    "title": "7. The Expiring Packet",
                    "prompt": "A packet begins with TTL 9 and travels through Router A, Switch B, Router C, Router D, then the destination. Does it arrive, and what TTL does the destination receive?",
                    "code": "PATH: Router A -> Switch B -> Router C -> Router D -> Destination\nINITIAL TTL = 9",
                    "rules": [
                        "In this network simulation, every router decreases TTL by 2.",
                        "Every switch decreases TTL by 1.",
                        "If TTL reaches zero or below before the destination is reached, discard the packet immediately.",
                        "A device labelled BRIDGE decreases TTL by 0. A wireless access point also decreases TTL by 0.",
                        "The destination does not modify TTL. Count each listed device once, in the order shown."
                    ]
                },
                {
                    "title": "8. The Firewall Code",
                    "prompt": "Transform the six-bit token using the firewall procedure. Report the final six-bit token.",
                    "code": "TOKEN = 111000",
                    "rules": [
                        "For a six-bit token, reverse the bits, XOR with the six-bit mask 110011, then rotate left by two positions.",
                        "For a four-bit token, reverse the bits, XOR with 1010, then rotate left by one position.",
                        "For an eight-bit token, do not reverse. XOR with 11110000, then rotate right by two positions.",
                        "Left rotation moves the leftmost bit(s) to the right end. Right rotation moves the rightmost bit(s) to the left end. No bits are discarded.",
                        "The mask and token must have the same width. Preserve leading zeroes."
                    ]
                },
                {
                    "title": "9. The Lost Password",
                    "prompt": "Decrypt the supplied text and report the original uppercase word.",
                    "code": "MODE = C3 | ENCRYPTED = KHOOR",
                    "rules": [
                        "For a message marked C3, decrypt by shifting each letter three places backward in the alphabet.",
                        "For a message marked C5, decrypt by shifting five places backward.",
                        "For a message marked C1, decrypt by shifting one place backward.",
                        "When shifting before A, continue from Z. Ignore spaces and punctuation; preserve them in their original positions.",
                        "The shift values in this manual describe decryption. Do not shift forward."
                    ]
                },
                {
                    "title": "10. The Authentication Sequence",
                    "prompt": "Use the six supplied values to generate the six-digit authentication code.",
                    "code": "A=3, B=7, C=2, D=9, E=4, F=1",
                    "rules": [
                        "For a six-field challenge, calculate digits in this exact order: (A+C) last digit; |B-D|; (E*F) last digit; A+F; C+E; B-F.",
                        "For a four-field challenge, output A, then B+C, then |D-A|, then the last digit of C*D.",
                        "For an eight-field challenge, output the values in reverse variable order, reducing each result modulo 10.",
                        "Whenever a step says last digit, use the ones digit only. Absolute value removes a negative sign. Do not insert spaces.",
                        "The final answer must contain exactly six decimal digits for this challenge."
                    ]
                }
            ]
        },
        # Page 4
        {
            "header": None,
            "items": [
                {
                    "title": "11. The Loop That Never Ends",
                    "prompt": "Execute the pseudocode exactly. Report the values printed.",
                    "code": "x = 2\ncount = 0\nwhile x < 30:\n    x = x * 2\n    count = count + 1\nprint(x, count)",
                    "rules": [
                        "A WHILE loop checks its condition before each iteration. If the condition is false, the body does not execute.",
                        "A REPEAT-UNTIL loop executes its body once before checking its stopping condition.",
                        "Execute statements inside the loop from top to bottom. The updated value of x is used in the next condition check.",
                        "Increase count once per completed loop iteration, not once per condition check.",
                        "Print variables in the exact order specified by the print statement."
                    ]
                },
                {
                    "title": "12. The Stack Overflow Mystery",
                    "prompt": "Perform the operations in order. Report the final stack from bottom to top.",
                    "code": "PUSH 10\nPUSH 20\nPUSH 30\nPOP\nPUSH 40\nPOP\nPUSH 50",
                    "rules": [
                        "PUSH adds an item to the top. POP removes the top item. The structure follows LIFO.",
                        "If the sheet says QUEUE, insertion occurs at the rear and removal occurs at the front (FIFO).",
                        "If the sheet says DEQUE, an instruction must specify FRONT or REAR; otherwise it is invalid.",
                        "A POP from an empty stack is an underflow error. Do not invent a value.",
                        "List the final stack from bottom to top, not in removal order."
                    ]
                },
                {
                    "title": "13. The Deadlock Sequence",
                    "prompt": "Determine whether the processes are deadlocked. If they are, apply the recovery protocol and give the completion order after recovery.",
                    "code": "P1 holds R1 and needs R2.\nP2 holds R2 and needs R3.\nP3 holds R3 and needs R1.\nNo resources are initially available.",
                    "rules": [
                        "A process may execute only when every resource it needs is available.",
                        "When a process completes, it releases every resource it holds.",
                        "If no process can execute, the system is considered deadlocked for this simulation.",
                        "Terminate the process with the lowest process number among those involved in the deadlock. Termination immediately releases its held resources. Then repeatedly execute any process whose need is met.",
                        "A system marked PRIORITY recovery terminates the process with the highest number. A system marked RANDOM recovery may terminate any one process. Neither label appears on this challenge."
                    ]
                }
            ]
        },
        # Page 5
        {
            "header": None,
            "items": [
                {
                    "title": "14. The Database Detective",
                    "prompt": "Apply the query to the supplied table. Report the resulting Name column in order.",
                    "code": "ID | Name | Score\n101 | A | 75\n102 | B | 90\n103 | C | 60\n104 | D | 85\n105 | E | 95\nSELECT Name FROM Students WHERE Score > 70 ORDER BY Score DESC;",
                    "rules": [
                        "WHERE filters rows before the output is produced. A strict greater-than sign excludes a value equal to the threshold.",
                        "Sort the remaining rows from highest value to lowest value.",
                        "ASC sorts from lowest to highest. If neither ASC nor DESC is stated, use the table's original order.",
                        "Only columns named after SELECT are displayed. Other columns may be used for filtering and sorting without being printed.",
                        "A NULL score does not satisfy a numeric comparison and is excluded from this query."
                    ]
                },
                {
                    "title": "15. The Cache Replacement Mystery",
                    "prompt": "A cache has three slots. Process the reference string and report the final cache contents from least recently used to most recently used.",
                    "code": "A, B, C, A, D, B, E",
                    "rules": [
                        "On a hit, mark the accessed item as most recently used. On a miss when full, remove the least recently used item.",
                        "In FIFO mode, a hit does not change insertion order. Remove the item that entered the cache earliest.",
                        "In MRU mode, remove the most recently used item when a miss occurs and the cache is full.",
                        "A newly inserted item becomes most recently used. A cache hit does not create a duplicate copy.",
                        "Report the final contents from oldest/least recent to newest/most recent, as requested by the challenge."
                    ]
                },
                {
                    "title": "16. The AI Classification Trap",
                    "prompt": "Calculate the risk score and classify the input.",
                    "code": "Temperature = 30\nHumidity = 70\nRainfall = 5 | PROFILE = RISK-3\nScore = (Temperature * 2) + (Humidity * 1) - (Rainfall * 3)",
                    "rules": [
                        "For a RISK-3 challenge: below 50 = LOW; 50 through 70 inclusive = MODERATE; above 70 = HIGH.",
                        "For RISK-2: below 40 = LOW; 40 through 60 inclusive = MODERATE; above 60 = HIGH.",
                        "For RISK-4: below 60 = LOW; 60 through 80 inclusive = MODERATE; above 80 = HIGH.",
                        "Calculate the complete score before selecting a band. Do not round intermediate values.",
                        "A value exactly equal to the upper boundary belongs to MODERATE, not HIGH."
                    ]
                },
                {
                    "title": "17. The Nearest Neighbour",
                    "prompt": "Classify X=(4,4) using the three nearest training points.",
                    "code": "A=(1,1), RED\nB=(3,4), BLUE\nC=(5,5), RED\nD=(7,7), BLUE\nE=(4,6), BLUE",
                    "rules": [
                        "Calculate Euclidean distance to every training point. Select the three smallest distances and use majority vote.",
                        "If the challenge card states K=1, use only the single closest neighbour.",
                        "If the distance label is MANHATTAN, use |x2-x1| + |y2-y1| instead of Euclidean distance.",
                        "If the selected neighbours produce a class tie, choose the class of the single closest neighbour.",
                        "Square roots need not be fully evaluated if squared distances are sufficient to rank the points. Do not include X itself as a training point."
                    ]
                }
            ]
        },
        # Page 6
        {
            "header": None,
            "items": [
                {
                    "title": "18. The Neural Network Black Box",
                    "prompt": "Calculate the output of the two-hidden-neuron network.",
                    "code": "Inputs: X1=1, X2=0\nWeights: X1->H1=2; X2->H1=3; X1->H2=1; X2->H2=4; H1->O=2; H2->O=1",
                    "rules": [
                        "For this challenge, each hidden neuron outputs 1 if its weighted sum is greater than or equal to 2; otherwise it outputs 0.",
                        "The output neuron uses the same threshold: weighted sum >= 2 gives 1; otherwise 0.",
                        "A neuron marked STRICT-2 outputs 1 only when its sum is greater than 2. A neuron marked SIGN-0 outputs 1 when its sum is greater than or equal to 0.",
                        "Calculate all hidden weighted sums first, apply hidden activation, then calculate the output weighted sum using the activated hidden values.",
                        "No bias values are supplied. Therefore, assume every bias is zero."
                    ]
                },
                {
                    "title": "19. The Robot With a Broken Compass",
                    "prompt": "A robot begins at (0,0), facing North. Execute the command sequence and report its final coordinate and direction.",
                    "code": "COMMANDS: F, R, F, F, L, F, L, F",
                    "rules": [
                        "F moves forward one grid unit in the current direction. R turns 90° clockwise without moving. L turns 90° anticlockwise without moving.",
                        "North is +Y, East is +X, South is -Y, and West is -X.",
                        "A command B moves one unit backward while preserving the robot's current facing direction. It does not turn the robot around.",
                        "A command D is valid only when the card specifies a diagonal direction. Do not infer diagonal movement from two consecutive turns.",
                        "Execute commands strictly from left to right. Turning changes orientation but not position."
                    ]
                },
                {
                    "title": "20. The Algorithm That Lies",
                    "prompt": "Execute the pseudocode exactly as written. Report the final array.",
                    "code": "A = [8, 3, 10, 2, 6]\nfor i in range(len(A)):\n    for j in range(i+1, len(A)):\n        if A[i] < A[j]:\n            A[i], A[j] = A[j], A[i]\nprint(A)",
                    "rules": [
                        "The outer loop visits i from 0 through len(A)-1. The inner loop visits j from i+1 through len(A)-1.",
                        "Swap only when A[i] is strictly less than A[j]. Equal values are not swapped.",
                        "A conventional descending sort may compare adjacent values or use a library function. Do not substitute a conventional sorting algorithm for the supplied pseudocode.",
                        "Every swap changes the array immediately. Later comparisons use the updated array, not the original array.",
                        "The first array element is at index 0. Stop when the loop bounds are exhausted."
                    ]
                }
            ]
        }
    ]

    PAGE_WIDTH = 595.276 # A4 width in pt
    PAGE_HEIGHT = 841.890 # A4 height in pt
    MARGIN_LEFT = 48
    MARGIN_RIGHT = 48
    USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

    for page_idx, p_data in enumerate(pages_data):
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        y = 45

        # Top Page Number
        page.insert_text(fitz.Point(MARGIN_LEFT, 32), str(page_idx + 1), fontsize=9, color=(0.4, 0.4, 0.4))

        # Title header on Page 1
        if p_data.get("header"):
            page.insert_text(fitz.Point(PAGE_WIDTH / 2 - 100, y + 10), "Borderland Trails", fontsize=22, color=(0.08, 0.18, 0.36))
            y += 32
            page.insert_text(fitz.Point(MARGIN_LEFT, y), "Technical Puzzle Manual", fontsize=13, color=(0.15, 0.15, 0.15))
            y += 18
            page.insert_text(fitz.Point(MARGIN_LEFT, y), "20 technical challenges and their operating instructions", fontsize=10, color=(0.4, 0.4, 0.4))
            y += 24

        for item in p_data["items"]:
            # Item Title
            page.insert_text(fitz.Point(MARGIN_LEFT, y), item["title"], fontsize=11, color=(0.08, 0.28, 0.52))
            y += 14

            # Prompt
            if item.get("prompt"):
                text_rect = fitz.Rect(MARGIN_LEFT, y, MARGIN_LEFT + USABLE_WIDTH, y + 40)
                rc = page.insert_textbox(text_rect, item["prompt"], fontsize=9, color=(0.15, 0.15, 0.15), lineheight=1.2)
                y += 22

            # Code / Data box
            if item.get("code"):
                lines = item["code"].split("\n")
                box_height = len(lines) * 12 + 10
                box_rect = fitz.Rect(MARGIN_LEFT, y, MARGIN_LEFT + USABLE_WIDTH, y + box_height)
                page.draw_rect(box_rect, color=(0.92, 0.93, 0.95), fill=(0.96, 0.96, 0.98))
                code_y = y + 10
                for line in lines:
                    page.insert_text(fitz.Point(MARGIN_LEFT + 12, code_y), line, fontsize=8.5, color=(0.1, 0.1, 0.1))
                    code_y += 12
                y += box_height + 8

            # Rules
            for rule in item.get("rules", []):
                rule_rect = fitz.Rect(MARGIN_LEFT + 10, y, MARGIN_LEFT + USABLE_WIDTH, y + 36)
                page.insert_text(fitz.Point(MARGIN_LEFT, y + 8), "-", fontsize=8.5, color=(0.3, 0.3, 0.3))
                h = page.insert_textbox(rule_rect, rule, fontsize=8.5, color=(0.25, 0.25, 0.25), lineheight=1.2)
                y += max(14, int(abs(h)) if h < 0 else 14) + 3

            y += 10 # spacing between items

        # Page bottom separator and footer
        page.draw_line(fitz.Point(MARGIN_LEFT, PAGE_HEIGHT - 35), fitz.Point(PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 35), color=(0.85, 0.85, 0.85), width=0.5)
        page.insert_text(fitz.Point(PAGE_WIDTH - MARGIN_RIGHT - 15, PAGE_HEIGHT - 22), str(page_idx + 1), fontsize=8.5, color=(0.4, 0.4, 0.4))

    doc.save(filename)
    print(f"Generated {filename} successfully with {len(doc)} pages.")

if __name__ == "__main__":
    create_manual_pdf()
