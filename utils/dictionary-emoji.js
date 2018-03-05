//Definitions from https://github.com/shanraisshan/EmojiCodeSheet/
const people = {"grinning_face":"😀","grimacing_face":"😬","grimacing_face_with_smile_eyes":"😁","face_with_tear_of_joy":"😂","smiling_face_with_open_mouth":"😃","smiling_face_with_open_mouth_eyes":"😄","smiling_face_with_open_mouth_cold_sweat":"😅","smiling_face_with_open_mouth_hand_tight":"😆","smiling_face_with_halo":"😇","winking_face":"😉","black_smiling_face":"😊","slightly_smiling_face":"🙂","upside_down_face":"🙃","white_smiling_face":"☺","face_savouring_delicious_food":"😋","relieved_face":"😌","smiling_face_heart_eyes":"😍","face_throwing_kiss":"😘","kissing_face":"😗","kissing_face_with_smile_eyes":"😙","kissing_face_with_closed_eyes":"😚","face_with_tongue_wink_eye":"😜","face_with_tongue_closed_eye":"😝","face_with_stuck_out_tongue":"😛","money_mouth_face":"🤑","nerd_face":"🤓","smiling_face_with_sun_glass":"😎","hugging_face":"🤗","smirking_face":"😏","face_without_mouth":"😶","neutral_face":"😐","expressionless_face":"😑","unamused_face":"😒","face_with_rolling_eyes":"🙄","thinking_face":"🤔","flushed_face":"😳","disappointed_face":"😞","worried_face":"😟","angry_face":"😠","pouting_face":"😡","pensive_face":"😔","confused_face":"😕","slightly_frowning_face":"🙁","white_frowning_face":"☹","persevering_face":"😣","confounded_face":"😖","tired_face":"😫","weary_face":"😩","face_with_look_of_triumph":"😤","face_with_open_mouth":"😮","face_screaming_in_fear":"😱","fearful_face":"😨","face_with_open_mouth_cold_sweat":"😰","hushed_face":"😯","frowning_face_with_open_mouth":"😦","anguished_face":"😧","crying_face":"😢","disappointed_but_relieved_face":"😥","sleepy_face":"😪","face_with_cold_sweat":"😓","loudly_crying_face":"😭","dizzy_face":"😵","astonished_face":"😲","zipper_mouth_face":"🤐","face_with_medical_mask":"😷","face_with_thermometer":"🤒","face_with_head_bandage":"🤕","sleeping_face":"😴","sleeping_symbol":"💤","pile_of_poo":"💩","smiling_face_with_horns":"😈","imp":"👿","japanese_ogre":"👹","japanese_goblin":"👺","skull":"💀","ghost":"👻","extra_terrestrial_alien":"👽","robot_face":"🤖","smiling_cat_face_open_mouth":"😺","grinning_cat_face_smile_eyes":"😸","cat_face_tears_of_joy":"😹","smiling_cat_face_heart_shaped_eyes":"😻","cat_face_wry_smile":"😼","kissing_cat_face_closed_eyes":"😽","weary_cat_face":"🙀","crying_cat_face":"😿","pouting_cat_face":"😾","person_both_hand_celebration":"🙌","person_both_hand_celebration_type_1_2":"🙌🏻","person_both_hand_celebration_type_3":"🙌🏼","person_both_hand_celebration_type_4":"🙌🏽","person_both_hand_celebration_type_5":"🙌🏾","person_both_hand_celebration_type_6":"🙌🏿","clapping_hand":"👏","clapping_hand_type_1_2":"👏🏼","clapping_hand_type_3":"👏🏼","clapping_hand_type_4":"👏🏽","clapping_hand_type_5":"👏🏾","clapping_hand_type_6":"👏🏿","waving_hands":"👋","waving_hands_type_1_2":"👋🏻","waving_hands_type_3":"👋🏼","waving_hands_type_4":"👋🏽","waving_hands_type_5":"👋🏾","waving_hands_type_6":"👋🏿","thumbs_up":"👍","thumbs_up_type_1_2":"👍🏻","thumbs_up_type_3":"👍🏼","thumbs_up_type_4":"👍🏽","thumbs_up_type_5":"👍🏾","thumbs_up_type_6":"👍🏿","thumbs_down":"👎","thumbs_down_type_1_2":"👎🏻","thumbs_down_type_3":"👎🏼","thumbs_down_type_4":"👎🏽","thumbs_down_type_5":"👎🏾","thumbs_down_type_6":"👎🏿","fist_hand":"👊","fist_hand_type_1_2":"👊🏻","fist_hand_type_3":"👊🏼","fist_hand_type_4":"👊🏽","fist_hand_type_5":"👊🏾","fist_hand_type_6":"👊🏿","raised_fist":"✊","raised_fist_type_1_2":"✊🏻","raised_fist_type_3":"✊🏼","raised_fist_type_4":"✊🏽","raised_fist_type_5":"✊🏾","raised_fist_type_6":"✊🏿","victory_hand":"✌","victory_hand_type_1_2":"✌🏻","victory_hand_type_3":"✌🏼","victory_hand_type_4":"✌🏽","victory_hand_type_5":"✌🏾","victory_hand_type_6":"✌🏿","ok_hand":"👌","ok_hand_type_1_2":"👌🏻","ok_hand_type_3":"👌🏼","ok_hand_type_4":"👌🏽","ok_hand_type_5":"👌🏾","ok_hand_type_6":"👌🏿","raised_hand":"✋","raised_hand_type_1_2":"✋🏻","raised_hand_type_3":"✋🏼","raised_hand_type_4":"✋🏽","raised_hand_type_5":"✋🏾","raised_hand_type_6":"✋🏿","open_hand":"👐","open_hand_type_1_2":"👐🏻","open_hand_type_3":"👐🏼","open_hand_type_4":"👐🏽","open_hand_type_5":"👐🏾","open_hand_type_6":"👐🏿","flexed_biceps":"💪","flexed_biceps_type_1_2":"💪🏻","flexed_biceps_type_3":"💪🏼","flexed_biceps_type_4":"💪🏽","flexed_biceps_type_5":"💪🏾","flexed_biceps_type_6":"💪🏿","folded_hands":"🙏","folded_hands_type_1_2":"🙏🏻","folded_hands_type_3":"🙏🏼","folded_hands_type_4":"🙏🏽","folded_hands_type_5":"🙏🏾","folded_hands_type_6":"🙏🏿","up_pointing_index":"☝","up_pointing_index_type_1_2":"☝🏻","up_pointing_index_type_3":"☝🏼","up_pointing_index_type_4":"☝🏽","up_pointing_index_type_5":"☝🏾","up_pointing_index_type_6":"☝🏿","up_pointing_backhand_index":"👆","up_pointing_backhand_index_type_1_2":"👆🏻","up_pointing_backhand_index_type_3":"👆🏼","up_pointing_backhand_index_type_4":"👆🏽","up_pointing_backhand_index_type_5":"👆🏾","up_pointing_backhand_index_type_6":"👆🏿","down_pointing_backhand_index":"👇","down_pointing_backhand_index_type_1_2":"👇🏻","down_pointing_backhand_index_type_3":"👇🏼","down_pointing_backhand_index_type_4":"👇🏽","down_pointing_backhand_index_type_5":"👇🏾","down_pointing_backhand_index_type_6":"👇🏿","left_pointing_backhand_index":"👈","left_pointing_backhand_index_type_1_2":"👈🏻","left_pointing_backhand_index_type_3":"👈🏼","left_pointing_backhand_index_type_4":"👈🏽","left_pointing_backhand_index_type_5":"👈🏾","left_pointing_backhand_index_type_6":"👈🏿","right_pointing_backhand_index":"👉","right_pointing_backhand_index_type_1_2":"👉🏻","right_pointing_backhand_index_type_3":"👉🏼","right_pointing_backhand_index_type_4":"👉🏽","right_pointing_backhand_index_type_5":"👉🏾","right_pointing_backhand_index_type_6":"👉🏿","reverse_middle_finger":"🖕","reverse_middle_finger_type_1_2":"🖕🏻","reverse_middle_finger_type_3":"🖕🏼","reverse_middle_finger_type_4":"🖕🏽","reverse_middle_finger_type_5":"🖕🏾","reverse_middle_finger_type_6":"🖕🏿","raised_hand_fingers_splayed":"🖐","raised_hand_fingers_splayed_type_1_2":"🖐🏻","raised_hand_fingers_splayed_type_3":"🖐🏼","raised_hand_fingers_splayed_type_4":"🖐🏽","raised_hand_fingers_splayed_type_5":"🖐🏾","raised_hand_fingers_splayed_type_6":"🖐🏿","sign_of_horn":"🤘","sign_of_horn_type_1_2":"🤘🏻","sign_of_horn_type_3":"🤘🏼","sign_of_horn_type_4":"🤘🏽","sign_of_horn_type_5":"🤘🏾","sign_of_horn_type_6":"🤘🏿","raised_hand_part_between_middle_ring":"🖖","raised_hand_part_between_middle_ring_type_1_2":"🖖🏻","raised_hand_part_between_middle_ring_type_3":"🖖🏼","raised_hand_part_between_middle_ring_type_4":"🖖🏽","raised_hand_part_between_middle_ring_type_5":"🖖🏾","raised_hand_part_between_middle_ring_type_6":"🖖🏿","writing_hand":"✍","writing_hand_type_1_2":"✍🏻","writing_hand_type_3":"✍🏼","writing_hand_type_4":"✍🏽","writing_hand_type_5":"✍🏾","writing_hand_type_6":"✍🏿","nail_polish":"💅","nail_polish_type_1_2":"💅🏻","nail_polish_type_3":"💅🏼","nail_polish_type_4":"💅🏽","nail_polish_type_5":"💅🏾","nail_polish_type_6":"💅🏿","mouth":"👄","tongue":"👅","ear":"👂","ear_type_1_2":"👂🏻","ear_type_3":"👂🏼","ear_type_4":"👂🏽","ear_type_5":"👂🏾","ear_type_6":"👂🏿","nose":"👃","nose_type_1_2":"👃🏻","nose_type_3":"👃🏼","nose_type_4":"👃🏽","nose_type_5":"👃🏾","nose_type_6":"👃🏿","eye":"👁","eyes":"👀","bust_in_silhouette":"👤","busts_in_silhouette":"👥","speaking_head_in_silhouette":"🗣","baby":"👶","baby_type_1_2":"👶🏻","baby_type_3":"👶🏼","baby_type_4":"👶🏽","baby_type_5":"👶🏾","baby_type_6":"👶🏿","boy":"👦","boy_type_1_2":"👦🏻","boy_type_3":"👦🏼","boy_type_4":"👦🏽","boy_type_5":"👦🏾","boy_type_6":"👦🏿","girl":"👧","girl_type_1_2":"👧🏻","girl_type_3":"👧🏼","girl_type_4":"👧🏽","girl_type_5":"👧🏾","girl_type_6":"👧🏿","man":"👨","man_type_1_2":"👨🏻","man_type_3":"👨🏼","man_type_4":"👨🏽","man_type_5":"👨🏾","man_type_6":"👨🏿","women":"👩","women_type_1_2":"👩🏻","women_type_3":"👩🏼","women_type_4":"👩🏽","women_type_5":"👩🏾","women_type_6":"👩🏿","person_with_blond_hair":"👱","person_with_blond_hair_type_1_2":"👱🏻","person_with_blond_hair_type_3":"👱🏼","person_with_blond_hair_type_4":"👱🏽","person_with_blond_hair_type_5":"👱🏾","person_with_blond_hair_type_6":"👱🏿","older_man":"👴","older_man_type_1_2":"👴🏻","older_man_type_3":"👴🏼","older_man_type_4":"👴🏽","older_man_type_5":"👴🏾","older_man_type_6":"👴🏿","older_women":"👵","older_women_type_1_2":"👵🏻","older_women_type_3":"👵🏼","older_women_type_4":"👵🏽","older_women_type_5":"👵🏾","older_women_type_6":"👵🏿","man_with_gua_pi_mao":"👲","man_with_gua_pi_mao_type_1_2":"👲🏼","man_with_gua_pi_mao_type_3":"👲🏼","man_with_gua_pi_mao_type_4":"👲🏽","man_with_gua_pi_mao_type_5":"👲🏾","man_with_gua_pi_mao_type_6":"👲🏿","man_with_turban":"👳","man_with_turban_type_1_2":"👳🏻","man_with_turban_type_3":"👳🏼","man_with_turban_type_4":"👳🏽","man_with_turban_type_5":"👳🏾","man_with_turban_type_6":"👳🏿","police_officer":"👮","police_officer_type_1_2":"👮🏻","police_officer_type_3":"👮🏼","police_officer_type_4":"👮🏽","police_officer_type_5":"👮🏾","police_officer_type_6":"👮🏿","construction_worker":"👷","construction_worker_type_1_2":"👷🏻","construction_worker_type_3":"👷🏼","construction_worker_type_4":"👷🏽","construction_worker_type_5":"👷🏾","construction_worker_type_6":"👷🏿","guards_man":"💂","guards_man_type_1_2":"💂🏻","guards_man_type_3":"💂🏼","guards_man_type_4":"💂🏽","guards_man_type_5":"💂🏾","guards_man_type_6":"💂🏿","spy":"🕵","father_christmas":"🎅","father_christmas_type_1_2":"🎅🏻","father_christmas_type_3":"🎅🏼","father_christmas_type_4":"🎅🏽","father_christmas_type_5":"🎅🏾","father_christmas_type_6":"🎅🏿","baby_angel":"👼","baby_angel_type_1_2":"👼🏻","baby_angel_type_3":"👼🏼","baby_angel_type_4":"👼🏽","baby_angel_type_5":"👼🏾","baby_angel_type_6":"👼🏿","princess":"👸","princess_type_1_2":"👸🏻","princess_type_3":"👸🏼","princess_type_4":"👸🏽","princess_type_5":"👸🏾","princess_type_6":"👸🏿","bride_with_veil":"👰","bride_with_veil_type_1_2":"👰🏻","bride_with_veil_type_3":"👰🏼","bride_with_veil_type_4":"👰🏽","bride_with_veil_type_5":"👰🏾","bride_with_veil_type_6":"👰🏿","pedestrian":"🚶","pedestrian_type_1_2":"🚶🏻","pedestrian_type_3":"🚶🏼","pedestrian_type_4":"🚶🏽","pedestrian_type_5":"🚶🏾","pedestrian_type_6":"🚶🏿","runner":"🏃","runner_type_1_2":"🏃🏻","runner_type_3":"🏃🏼","runner_type_4":"🏃🏽","runner_type_5":"🏃🏾","runner_type_6":"🏃🏿","dancer":"💃","dancer_type_1_2":"💃🏻","dancer_type_3":"💃🏼","dancer_type_4":"💃🏽","dancer_type_5":"💃🏾","dancer_type_6":"💃🏿","women_with_bunny_years":"👯","man_women_holding_hands":"👫","two_man_holding_hands":"👬","two_women_holding_hands":"👭","person_bowing_deeply":"🙇","person_bowing_deeply_type_1_2":"🙇🏻","person_bowing_deeply_type_3":"🙇🏼","person_bowing_deeply_type_4":"🙇🏽","person_bowing_deeply_type_5":"🙇🏾","person_bowing_deeply_type_6":"🙇🏿","information_desk_person":"💁","information_desk_person_type_1_2":"💁🏻","information_desk_person_type_3":"💁🏼","information_desk_person_type_4":"💁🏽","information_desk_person_type_5":"💁🏾","information_desk_person_type_6":"💁🏿","face_with_no_good_gesture":"🙅","face_with_no_good_gesture_type_1_2":"🙅🏻","face_with_no_good_gesture_type_3":"🙅🏼","face_with_no_good_gesture_type_4":"🙅🏽","face_with_no_good_gesture_type_5":"🙅🏾","face_with_no_good_gesture_type_6":"🙅🏿","face_with_ok_gesture":"🙆","face_with_ok_gesture_type_1_2":"🙆🏻","face_with_ok_gesture_type_3":"🙆🏼","face_with_ok_gesture_type_4":"🙆🏽","face_with_ok_gesture_type_5":"🙆🏾","face_with_ok_gesture_type_6":"🙆🏿","happy_person_raise_one_hand":"🙋","happy_person_raise_one_hand_type_1_2":"🙋🏻","happy_person_raise_one_hand_type_3":"🙋🏼","happy_person_raise_one_hand_type_4":"🙋🏽","happy_person_raise_one_hand_type_5":"🙋🏾","happy_person_raise_one_hand_type_6":"🙋🏿","person_with_pouting_face":"🙎","person_with_pouting_face_type_1_2":"🙎🏻","person_with_pouting_face_type_3":"🙎🏼","person_with_pouting_face_type_4":"🙎🏽","person_with_pouting_face_type_5":"🙎🏾","person_with_pouting_face_type_6":"🙎🏿","person_frowning":"🙍","person_frowning_type_1_2":"🙍🏻","person_frowning_type_3":"🙍🏼","person_frowning_type_4":"🙍🏽","person_frowning_type_5":"🙍🏾","person_frowning_type_6":"🙍🏿","haircut":"💇","haircut_type_1_2":"💇🏻","haircut_type_3":"💇🏼","haircut_type_4":"💇🏽","haircut_type_5":"💇🏾","haircut_type_6":"💇🏿","face_massage":"💆","face_massage_type_1_2":"💆🏻","face_massage_type_3":"💆🏻","face_massage_type_4":"💆🏽","face_massage_type_5":"💆🏾","face_massage_type_6":"💆🏿","couple_with_heart":"💑","couple_with_heart_woman":"👩‍❤️‍👩","couple_with_heart_man":"👨‍❤️‍👨","kiss":"💏","kiss_woman":"👩‍❤️‍💋‍👩","kiss_man":"👨‍❤️‍💋‍👨","family":"👪","family_man_women_girl":"👨‍👩‍👧","family_man_women_girl_boy":"👨‍👩‍👧‍👦","family_man_women_boy_boy":"👨‍👩‍👦‍👦","family_man_women_girl_girl":"👨‍👩‍👧‍👧","family_woman_women_boy":"👩‍👩‍👦","family_woman_women_girl":"👩‍👩‍👧","family_woman_women_girl_boy":"👩‍👩‍👧‍👦","family_woman_women_boy_boy":"👩‍👩‍👦‍👦","family_woman_women_girl_girl":"👩‍👩‍👧‍👧","family_man_man_boy":"👨‍👨‍👦","family_man_man_girl":"👨‍👨‍👧","family_man_man_girl_boy":"👨‍👨‍👧‍👦","family_man_man_boy_boy":"👨‍👨‍👦‍👦","family_man_man_girl_girl":"👨‍👨‍👧‍👧","woman_clothes":"👚","t_shirt":"👕","jeans":"👖","necktie":"👔","dress":"👗","bikini":"👙","kimono":"👘","lipstick":"💄","kiss_mark":"💋","footprints":"👣","high_heeled_shoe":"👠","woman_sandal":"👡","woman_boots":"👢","man_shoe":"👞","athletic_shoe":"👟","woman_hat":"👒","top_hat":"🎩","graduation_cap":"🎓","crown":"👑","helmet_with_white_cross":"⛑","school_satchel":"🎒","pouch":"👝","purse":"👛","handbag":"👜","briefcase":"💼","eye_glasses":"👓","dark_sun_glasses":"🕶","ring":"💍","closed_umbrella":"🌂"};
const emojis = {...people};
module.exports = emojis ;