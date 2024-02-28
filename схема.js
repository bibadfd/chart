var zip_WSIZE = 32768,
    zip_STORED_BLOCK = 0,
    zip_STATIC_TREES = 1,
    zip_DYN_TREES = 2,
    zip_DEFAULT_LEVEL = 6,
    zip_FULL_SEARCH = !0,
    zip_INBUFSIZ = 32768,
    zip_INBUF_EXTRA = 64,
    zip_OUTBUFSIZ = 8192,
    zip_window_size = 2 * zip_WSIZE,
    zip_MIN_MATCH = 3,
    zip_MAX_MATCH = 258,
    zip_BITS = 16,
    zip_LIT_BUFSIZE = 8192,
    zip_HASH_BITS = 13;
zip_LIT_BUFSIZE > zip_INBUFSIZ && alert("error: zip_INBUFSIZ is too small"), zip_WSIZE << 1 > 1 << zip_BITS && alert("error: zip_WSIZE is too large"), zip_HASH_BITS > zip_BITS - 1 && alert("error: zip_HASH_BITS is too large"), (zip_HASH_BITS < 8 || 258 != zip_MAX_MATCH) && alert("error: Code too clever");
var zip_free_queue, zip_qhead, zip_qtail, zip_initflag, zip_outcnt, zip_outoff, zip_complete, zip_window, zip_d_buf, zip_l_buf, zip_prev, zip_bi_buf, zip_bi_valid, zip_block_start, zip_ins_h, zip_hash_head, zip_prev_match, zip_match_available, zip_match_length, zip_prev_length, zip_strstart, zip_match_start, zip_eofile, zip_lookahead, zip_max_chain_length, zip_max_lazy_match, zip_compr_level, zip_good_match, zip_nice_match, zip_dyn_ltree, zip_dyn_dtree, zip_static_ltree, zip_static_dtree, zip_bl_tree, zip_l_desc, zip_d_desc, zip_bl_desc, zip_bl_count, zip_heap, zip_heap_len, zip_heap_max, zip_depth, zip_length_code, zip_dist_code, zip_base_length, zip_base_dist, zip_flag_buf, zip_last_lit, zip_last_dist, zip_last_flags, zip_flags, zip_flag_bit, zip_opt_len, zip_static_len, zip_deflate_data, zip_deflate_pos, zip_DIST_BUFSIZE = zip_LIT_BUFSIZE,
    zip_HASH_SIZE = 1 << zip_HASH_BITS,
    zip_HASH_MASK = zip_HASH_SIZE - 1,
    zip_WMASK = zip_WSIZE - 1,
    zip_NIL = 0,
    zip_TOO_FAR = 4096,
    zip_MIN_LOOKAHEAD = zip_MAX_MATCH + zip_MIN_MATCH + 1,
    zip_MAX_DIST = zip_WSIZE - zip_MIN_LOOKAHEAD,
    zip_SMALLEST = 1,
    zip_MAX_BITS = 15,
    zip_MAX_BL_BITS = 7,
    zip_LENGTH_CODES = 29,
    zip_LITERALS = 256,
    zip_END_BLOCK = 256,
    zip_L_CODES = zip_LITERALS + 1 + zip_LENGTH_CODES,
    zip_D_CODES = 30,
    zip_BL_CODES = 19,
    zip_REP_3_6 = 16,
    zip_REPZ_3_10 = 17,
    zip_REPZ_11_138 = 18,
    zip_HEAP_SIZE = 2 * zip_L_CODES + 1,
    zip_H_SHIFT = parseInt((zip_HASH_BITS + zip_MIN_MATCH - 1) / zip_MIN_MATCH),
    zip_outbuf = null,
    zip_extra_lbits = new Array(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0),
    zip_extra_dbits = new Array(0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13),
    zip_extra_blbits = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7),
    zip_bl_order = new Array(16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15),
    zip_configuration_table = new Array(new zip_DeflateConfiguration(0, 0, 0, 0), new zip_DeflateConfiguration(4, 4, 8, 4), new zip_DeflateConfiguration(4, 5, 16, 8), new zip_DeflateConfiguration(4, 6, 32, 32), new zip_DeflateConfiguration(4, 4, 16, 16), new zip_DeflateConfiguration(8, 16, 32, 32), new zip_DeflateConfiguration(8, 16, 128, 128), new zip_DeflateConfiguration(8, 32, 128, 256), new zip_DeflateConfiguration(32, 128, 258, 1024), new zip_DeflateConfiguration(32, 258, 258, 4096));

function zip_DeflateCT() {
    this.fc = 0, this.dl = 0
}

function zip_DeflateTreeDesc() {
    this.dyn_tree = null, this.static_tree = null, this.extra_bits = null, this.extra_base = 0, this.elems = 0, this.max_length = 0, this.max_code = 0
}

function zip_DeflateConfiguration(_, i, p, z) {
    this.good_length = _, this.max_lazy = i, this.nice_length = p, this.max_chain = z
}

function zip_DeflateBuffer() {
    this.next = null, this.len = 0, this.ptr = new Array(zip_OUTBUFSIZ), this.off = 0
}

function zip_deflate_start(_) {
    var i;
    if (_ ? _ < 1 ? _ = 1 : _ > 9 && (_ = 9) : _ = zip_DEFAULT_LEVEL, zip_compr_level = _, zip_initflag = !1, zip_eofile = !1, null == zip_outbuf) {
        for (zip_free_queue = zip_qhead = zip_qtail = null, zip_outbuf = new Array(zip_OUTBUFSIZ), zip_window = new Array(zip_window_size), zip_d_buf = new Array(zip_DIST_BUFSIZE), zip_l_buf = new Array(zip_INBUFSIZ + zip_INBUF_EXTRA), zip_prev = new Array(1 << zip_BITS), zip_dyn_ltree = new Array(zip_HEAP_SIZE), i = 0; i < zip_HEAP_SIZE; i++) zip_dyn_ltree[i] = new zip_DeflateCT;
        for (zip_dyn_dtree = new Array(2 * zip_D_CODES + 1), i = 0; i < 2 * zip_D_CODES + 1; i++) zip_dyn_dtree[i] = new zip_DeflateCT;
        for (zip_static_ltree = new Array(zip_L_CODES + 2), i = 0; i < zip_L_CODES + 2; i++) zip_static_ltree[i] = new zip_DeflateCT;
        for (zip_static_dtree = new Array(zip_D_CODES), i = 0; i < zip_D_CODES; i++) zip_static_dtree[i] = new zip_DeflateCT;
        for (zip_bl_tree = new Array(2 * zip_BL_CODES + 1), i = 0; i < 2 * zip_BL_CODES + 1; i++) zip_bl_tree[i] = new zip_DeflateCT;
        zip_l_desc = new zip_DeflateTreeDesc, zip_d_desc = new zip_DeflateTreeDesc, zip_bl_desc = new zip_DeflateTreeDesc, zip_bl_count = new Array(zip_MAX_BITS + 1), zip_heap = new Array(2 * zip_L_CODES + 1), zip_depth = new Array(2 * zip_L_CODES + 1), zip_length_code = new Array(zip_MAX_MATCH - zip_MIN_MATCH + 1), zip_dist_code = new Array(512), zip_base_length = new Array(zip_LENGTH_CODES), zip_base_dist = new Array(zip_D_CODES), zip_flag_buf = new Array(parseInt(zip_LIT_BUFSIZE / 8))
    }
}

function zip_deflate_end() {
    zip_free_queue = zip_qhead = zip_qtail = null, zip_outbuf = null, zip_window = null, zip_d_buf = null, zip_l_buf = null, zip_prev = null, zip_dyn_ltree = null, zip_dyn_dtree = null, zip_static_ltree = null, zip_static_dtree = null, zip_bl_tree = null, zip_l_desc = null, zip_d_desc = null, zip_bl_desc = null, zip_bl_count = null, zip_heap = null, zip_depth = null, zip_length_code = null, zip_dist_code = null, zip_base_length = null, zip_base_dist = null, zip_flag_buf = null
}

function zip_reuse_queue(_) {
    _.next = zip_free_queue, zip_free_queue = _
}

function zip_new_queue() {
    var _;
    return null != zip_free_queue ? (_ = zip_free_queue, zip_free_queue = zip_free_queue.next) : _ = new zip_DeflateBuffer, _.next = null, _.len = _.off = 0, _
}

function zip_head1(_) {
    return zip_prev[zip_WSIZE + _]
}

function zip_head2(_, i) {
    return zip_prev[zip_WSIZE + _] = i
}

function zip_put_byte(_) {
    zip_outbuf[zip_outoff + zip_outcnt++] = _, zip_outoff + zip_outcnt == zip_OUTBUFSIZ && zip_qoutbuf()
}

function zip_put_short(_) {
    _ &= 65535, zip_outoff + zip_outcnt < zip_OUTBUFSIZ - 2 ? (zip_outbuf[zip_outoff + zip_outcnt++] = 255 & _, zip_outbuf[zip_outoff + zip_outcnt++] = _ >>> 8) : (zip_put_byte(255 & _), zip_put_byte(_ >>> 8))
}

function zip_INSERT_STRING() {
    zip_ins_h = (zip_ins_h << zip_H_SHIFT ^ 255 & zip_window[zip_strstart + zip_MIN_MATCH - 1]) & zip_HASH_MASK, zip_hash_head = zip_head1(zip_ins_h), zip_prev[zip_strstart & zip_WMASK] = zip_hash_head, zip_head2(zip_ins_h, zip_strstart)
}

function zip_SEND_CODE(_, i) {
    zip_send_bits(i[_].fc, i[_].dl)
}

function zip_D_CODE(_) {
    return 255 & (_ < 256 ? zip_dist_code[_] : zip_dist_code[256 + (_ >> 7)])
}

function zip_SMALLER(_, i, p) {
    return _[i].fc < _[p].fc || _[i].fc == _[p].fc && zip_depth[i] <= zip_depth[p]
}

function zip_read_buff(_, i, p) {
    var z;
    for (z = 0; z < p && zip_deflate_pos < zip_deflate_data.length; z++) _[i + z] = 255 & zip_deflate_data.charCodeAt(zip_deflate_pos++);
    return z
}

function zip_lm_init() {
    var _;
    for (_ = 0; _ < zip_HASH_SIZE; _++) zip_prev[zip_WSIZE + _] = 0;
    if (zip_max_lazy_match = zip_configuration_table[zip_compr_level].max_lazy, zip_good_match = zip_configuration_table[zip_compr_level].good_length, zip_FULL_SEARCH || (zip_nice_match = zip_configuration_table[zip_compr_level].nice_length), zip_max_chain_length = zip_configuration_table[zip_compr_level].max_chain, zip_strstart = 0, zip_block_start = 0, (zip_lookahead = zip_read_buff(zip_window, 0, 2 * zip_WSIZE)) <= 0) return zip_eofile = !0, void(zip_lookahead = 0);
    for (zip_eofile = !1; zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile;) zip_fill_window();
    for (zip_ins_h = 0, _ = 0; _ < zip_MIN_MATCH - 1; _++) zip_ins_h = (zip_ins_h << zip_H_SHIFT ^ 255 & zip_window[_]) & zip_HASH_MASK
}

function zip_longest_match(_) {
    var i, p, z = zip_max_chain_length,
        e = zip_strstart,
        t = zip_prev_length,
        a = zip_strstart > zip_MAX_DIST ? zip_strstart - zip_MAX_DIST : zip_NIL,
        l = zip_strstart + zip_MAX_MATCH,
        n = zip_window[e + t - 1],
        r = zip_window[e + t];
    zip_prev_length >= zip_good_match && (z >>= 2);
    do {
        if (zip_window[(i = _) + t] == r && zip_window[i + t - 1] == n && zip_window[i] == zip_window[e] && zip_window[++i] == zip_window[e + 1]) {
            e += 2, i++;
            do {} while (zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && zip_window[++e] == zip_window[++i] && e < l);
            if (p = zip_MAX_MATCH - (l - e), e = l - zip_MAX_MATCH, p > t) {
                if (zip_match_start = _, t = p, zip_FULL_SEARCH) {
                    if (p >= zip_MAX_MATCH) break
                } else if (p >= zip_nice_match) break;
                n = zip_window[e + t - 1], r = zip_window[e + t]
            }
        }
    } while ((_ = zip_prev[_ & zip_WMASK]) > a && 0 != --z);
    return t
}

function zip_fill_window() {
    var _, i, p = zip_window_size - zip_lookahead - zip_strstart;
    if (-1 == p) p--;
    else if (zip_strstart >= zip_WSIZE + zip_MAX_DIST) {
        for (_ = 0; _ < zip_WSIZE; _++) zip_window[_] = zip_window[_ + zip_WSIZE];
        for (zip_match_start -= zip_WSIZE, zip_strstart -= zip_WSIZE, zip_block_start -= zip_WSIZE, _ = 0; _ < zip_HASH_SIZE; _++) zip_head2(_, (i = zip_head1(_)) >= zip_WSIZE ? i - zip_WSIZE : zip_NIL);
        for (_ = 0; _ < zip_WSIZE; _++) i = zip_prev[_], zip_prev[_] = i >= zip_WSIZE ? i - zip_WSIZE : zip_NIL;
        p += zip_WSIZE
    }
    zip_eofile || ((_ = zip_read_buff(zip_window, zip_strstart + zip_lookahead, p)) <= 0 ? zip_eofile = !0 : zip_lookahead += _)
}

function zip_deflate_fast() {
    for (; 0 != zip_lookahead && null == zip_qhead;) {
        var _;
        if (zip_INSERT_STRING(), zip_hash_head != zip_NIL && zip_strstart - zip_hash_head <= zip_MAX_DIST && (zip_match_length = zip_longest_match(zip_hash_head)) > zip_lookahead && (zip_match_length = zip_lookahead), zip_match_length >= zip_MIN_MATCH)
            if (_ = zip_ct_tally(zip_strstart - zip_match_start, zip_match_length - zip_MIN_MATCH), zip_lookahead -= zip_match_length, zip_match_length <= zip_max_lazy_match) {
                zip_match_length--;
                do {
                    zip_strstart++, zip_INSERT_STRING()
                } while (0 != --zip_match_length);
                zip_strstart++
            } else zip_strstart += zip_match_length, zip_match_length = 0, zip_ins_h = ((zip_ins_h = 255 & zip_window[zip_strstart]) << zip_H_SHIFT ^ 255 & zip_window[zip_strstart + 1]) & zip_HASH_MASK;
        else _ = zip_ct_tally(0, 255 & zip_window[zip_strstart]), zip_lookahead--, zip_strstart++;
        for (_ && (zip_flush_block(0), zip_block_start = zip_strstart); zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile;) zip_fill_window()
    }
}

function zip_deflate_better() {
    for (; 0 != zip_lookahead && null == zip_qhead;) {
        if (zip_INSERT_STRING(), zip_prev_length = zip_match_length, zip_prev_match = zip_match_start, zip_match_length = zip_MIN_MATCH - 1, zip_hash_head != zip_NIL && zip_prev_length < zip_max_lazy_match && zip_strstart - zip_hash_head <= zip_MAX_DIST && ((zip_match_length = zip_longest_match(zip_hash_head)) > zip_lookahead && (zip_match_length = zip_lookahead), zip_match_length == zip_MIN_MATCH && zip_strstart - zip_match_start > zip_TOO_FAR && zip_match_length--), zip_prev_length >= zip_MIN_MATCH && zip_match_length <= zip_prev_length) {
            var _;
            _ = zip_ct_tally(zip_strstart - 1 - zip_prev_match, zip_prev_length - zip_MIN_MATCH), zip_lookahead -= zip_prev_length - 1, zip_prev_length -= 2;
            do {
                zip_strstart++, zip_INSERT_STRING()
            } while (0 != --zip_prev_length);
            zip_match_available = 0, zip_match_length = zip_MIN_MATCH - 1, zip_strstart++, _ && (zip_flush_block(0), zip_block_start = zip_strstart)
        } else 0 != zip_match_available ? (zip_ct_tally(0, 255 & zip_window[zip_strstart - 1]) && (zip_flush_block(0), zip_block_start = zip_strstart), zip_strstart++, zip_lookahead--) : (zip_match_available = 1, zip_strstart++, zip_lookahead--);
        for (; zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile;) zip_fill_window()
    }
}

function zip_init_deflate() {
    zip_eofile || (zip_bi_buf = 0, zip_bi_valid = 0, zip_ct_init(), zip_lm_init(), zip_qhead = null, zip_outcnt = 0, zip_outoff = 0, zip_compr_level <= 3 ? (zip_prev_length = zip_MIN_MATCH - 1, zip_match_length = 0) : (zip_match_length = zip_MIN_MATCH - 1, zip_match_available = 0), zip_complete = !1)
}

function zip_deflate_internal(_, i, p) {
    var z;
    return zip_initflag || (zip_init_deflate(), zip_initflag = !0, 0 != zip_lookahead) ? (z = zip_qcopy(_, i, p)) == p ? p : zip_complete ? z : (zip_compr_level <= 3 ? zip_deflate_fast() : zip_deflate_better(), 0 == zip_lookahead && (0 != zip_match_available && zip_ct_tally(0, 255 & zip_window[zip_strstart - 1]), zip_flush_block(1), zip_complete = !0), z + zip_qcopy(_, z + i, p - z)) : (zip_complete = !0, 0)
}

function zip_qcopy(_, i, p) {
    var z, e, t;
    for (z = 0; null != zip_qhead && z < p;) {
        for ((e = p - z) > zip_qhead.len && (e = zip_qhead.len), t = 0; t < e; t++) _[i + z + t] = zip_qhead.ptr[zip_qhead.off + t];
        var a;
        if (zip_qhead.off += e, zip_qhead.len -= e, z += e, 0 == zip_qhead.len) a = zip_qhead, zip_qhead = zip_qhead.next, zip_reuse_queue(a)
    }
    if (z == p) return z;
    if (zip_outoff < zip_outcnt) {
        for ((e = p - z) > zip_outcnt - zip_outoff && (e = zip_outcnt - zip_outoff), t = 0; t < e; t++) _[i + z + t] = zip_outbuf[zip_outoff + t];
        z += e, zip_outcnt == (zip_outoff += e) && (zip_outcnt = zip_outoff = 0)
    }
    return z
}

function zip_ct_init() {
    var _, i, p, z, e;
    if (0 == zip_static_dtree[0].dl) {
        for (zip_l_desc.dyn_tree = zip_dyn_ltree, zip_l_desc.static_tree = zip_static_ltree, zip_l_desc.extra_bits = zip_extra_lbits, zip_l_desc.extra_base = zip_LITERALS + 1, zip_l_desc.elems = zip_L_CODES, zip_l_desc.max_length = zip_MAX_BITS, zip_l_desc.max_code = 0, zip_d_desc.dyn_tree = zip_dyn_dtree, zip_d_desc.static_tree = zip_static_dtree, zip_d_desc.extra_bits = zip_extra_dbits, zip_d_desc.extra_base = 0, zip_d_desc.elems = zip_D_CODES, zip_d_desc.max_length = zip_MAX_BITS, zip_d_desc.max_code = 0, zip_bl_desc.dyn_tree = zip_bl_tree, zip_bl_desc.static_tree = null, zip_bl_desc.extra_bits = zip_extra_blbits, zip_bl_desc.extra_base = 0, zip_bl_desc.elems = zip_BL_CODES, zip_bl_desc.max_length = zip_MAX_BL_BITS, zip_bl_desc.max_code = 0, p = 0, z = 0; z < zip_LENGTH_CODES - 1; z++)
            for (zip_base_length[z] = p, _ = 0; _ < 1 << zip_extra_lbits[z]; _++) zip_length_code[p++] = z;
        for (zip_length_code[p - 1] = z, e = 0, z = 0; z < 16; z++)
            for (zip_base_dist[z] = e, _ = 0; _ < 1 << zip_extra_dbits[z]; _++) zip_dist_code[e++] = z;
        for (e >>= 7; z < zip_D_CODES; z++)
            for (zip_base_dist[z] = e << 7, _ = 0; _ < 1 << zip_extra_dbits[z] - 7; _++) zip_dist_code[256 + e++] = z;
        for (i = 0; i <= zip_MAX_BITS; i++) zip_bl_count[i] = 0;
        for (_ = 0; _ <= 143;) zip_static_ltree[_++].dl = 8, zip_bl_count[8]++;
        for (; _ <= 255;) zip_static_ltree[_++].dl = 9, zip_bl_count[9]++;
        for (; _ <= 279;) zip_static_ltree[_++].dl = 7, zip_bl_count[7]++;
        for (; _ <= 287;) zip_static_ltree[_++].dl = 8, zip_bl_count[8]++;
        for (zip_gen_codes(zip_static_ltree, zip_L_CODES + 1), _ = 0; _ < zip_D_CODES; _++) zip_static_dtree[_].dl = 5, zip_static_dtree[_].fc = zip_bi_reverse(_, 5);
        zip_init_block()
    }
}

function zip_init_block() {
    var _;
    for (_ = 0; _ < zip_L_CODES; _++) zip_dyn_ltree[_].fc = 0;
    for (_ = 0; _ < zip_D_CODES; _++) zip_dyn_dtree[_].fc = 0;
    for (_ = 0; _ < zip_BL_CODES; _++) zip_bl_tree[_].fc = 0;
    zip_dyn_ltree[zip_END_BLOCK].fc = 1, zip_opt_len = zip_static_len = 0, zip_last_lit = zip_last_dist = zip_last_flags = 0, zip_flags = 0, zip_flag_bit = 1
}

function zip_pqdownheap(_, i) {
    for (var p = zip_heap[i], z = i << 1; z <= zip_heap_len && (z < zip_heap_len && zip_SMALLER(_, zip_heap[z + 1], zip_heap[z]) && z++, !zip_SMALLER(_, p, zip_heap[z]));) zip_heap[i] = zip_heap[z], i = z, z <<= 1;
    zip_heap[i] = p
}

function zip_gen_bitlen(_) {
    var i, p, z, e, t, a, l = _.dyn_tree,
        n = _.extra_bits,
        r = _.extra_base,
        o = _.max_code,
        d = _.max_length,
        s = _.static_tree,
        f = 0;
    for (e = 0; e <= zip_MAX_BITS; e++) zip_bl_count[e] = 0;
    for (l[zip_heap[zip_heap_max]].dl = 0, i = zip_heap_max + 1; i < zip_HEAP_SIZE; i++)(e = l[l[p = zip_heap[i]].dl].dl + 1) > d && (e = d, f++), l[p].dl = e, p > o || (zip_bl_count[e]++, t = 0, p >= r && (t = n[p - r]), a = l[p].fc, zip_opt_len += a * (e + t), null != s && (zip_static_len += a * (s[p].dl + t)));
    if (0 != f) {
        do {
            for (e = d - 1; 0 == zip_bl_count[e];) e--;
            zip_bl_count[e]--, zip_bl_count[e + 1] += 2, zip_bl_count[d]--, f -= 2
        } while (f > 0);
        for (e = d; 0 != e; e--)
            for (p = zip_bl_count[e]; 0 != p;)(z = zip_heap[--i]) > o || (l[z].dl != e && (zip_opt_len += (e - l[z].dl) * l[z].fc, l[z].fc = e), p--)
    }
}

function zip_gen_codes(_, i) {
    var p, z, e = new Array(zip_MAX_BITS + 1),
        t = 0;
    for (p = 1; p <= zip_MAX_BITS; p++) t = t + zip_bl_count[p - 1] << 1, e[p] = t;
    for (z = 0; z <= i; z++) {
        var a = _[z].dl;
        0 != a && (_[z].fc = zip_bi_reverse(e[a]++, a))
    }
}

function zip_build_tree(_) {
    var i, p, z = _.dyn_tree,
        e = _.static_tree,
        t = _.elems,
        a = -1,
        l = t;
    for (zip_heap_len = 0, zip_heap_max = zip_HEAP_SIZE, i = 0; i < t; i++) 0 != z[i].fc ? (zip_heap[++zip_heap_len] = a = i, zip_depth[i] = 0) : z[i].dl = 0;
    for (; zip_heap_len < 2;) {
        var n = zip_heap[++zip_heap_len] = a < 2 ? ++a : 0;
        z[n].fc = 1, zip_depth[n] = 0, zip_opt_len--, null != e && (zip_static_len -= e[n].dl)
    }
    for (_.max_code = a, i = zip_heap_len >> 1; i >= 1; i--) zip_pqdownheap(z, i);
    do {
        i = zip_heap[zip_SMALLEST], zip_heap[zip_SMALLEST] = zip_heap[zip_heap_len--], zip_pqdownheap(z, zip_SMALLEST), p = zip_heap[zip_SMALLEST], zip_heap[--zip_heap_max] = i, zip_heap[--zip_heap_max] = p, z[l].fc = z[i].fc + z[p].fc, zip_depth[i] > zip_depth[p] + 1 ? zip_depth[l] = zip_depth[i] : zip_depth[l] = zip_depth[p] + 1, z[i].dl = z[p].dl = l, zip_heap[zip_SMALLEST] = l++, zip_pqdownheap(z, zip_SMALLEST)
    } while (zip_heap_len >= 2);
    zip_heap[--zip_heap_max] = zip_heap[zip_SMALLEST], zip_gen_bitlen(_), zip_gen_codes(z, a)
}

function zip_scan_tree(_, i) {
    var p, z, e = -1,
        t = _[0].dl,
        a = 0,
        l = 7,
        n = 4;
    for (0 == t && (l = 138, n = 3), _[i + 1].dl = 65535, p = 0; p <= i; p++) z = t, t = _[p + 1].dl, ++a < l && z == t || (a < n ? zip_bl_tree[z].fc += a : 0 != z ? (z != e && zip_bl_tree[z].fc++, zip_bl_tree[zip_REP_3_6].fc++) : a <= 10 ? zip_bl_tree[zip_REPZ_3_10].fc++ : zip_bl_tree[zip_REPZ_11_138].fc++, a = 0, e = z, 0 == t ? (l = 138, n = 3) : z == t ? (l = 6, n = 3) : (l = 7, n = 4))
}

function zip_send_tree(_, i) {
    var p, z, e = -1,
        t = _[0].dl,
        a = 0,
        l = 7,
        n = 4;
    for (0 == t && (l = 138, n = 3), p = 0; p <= i; p++)
        if (z = t, t = _[p + 1].dl, !(++a < l && z == t)) {
            if (a < n)
                do {
                    zip_SEND_CODE(z, zip_bl_tree)
                } while (0 != --a);
            else 0 != z ? (z != e && (zip_SEND_CODE(z, zip_bl_tree), a--), zip_SEND_CODE(zip_REP_3_6, zip_bl_tree), zip_send_bits(a - 3, 2)) : a <= 10 ? (zip_SEND_CODE(zip_REPZ_3_10, zip_bl_tree), zip_send_bits(a - 3, 3)) : (zip_SEND_CODE(zip_REPZ_11_138, zip_bl_tree), zip_send_bits(a - 11, 7));
            a = 0, e = z, 0 == t ? (l = 138, n = 3) : z == t ? (l = 6, n = 3) : (l = 7, n = 4)
        }
}

function zip_build_bl_tree() {
    var _;
    for (zip_scan_tree(zip_dyn_ltree, zip_l_desc.max_code), zip_scan_tree(zip_dyn_dtree, zip_d_desc.max_code), zip_build_tree(zip_bl_desc), _ = zip_BL_CODES - 1; _ >= 3 && 0 == zip_bl_tree[zip_bl_order[_]].dl; _--);
    return zip_opt_len += 3 * (_ + 1) + 5 + 5 + 4, _
}

function zip_send_all_trees(_, i, p) {
    var z;
    for (zip_send_bits(_ - 257, 5), zip_send_bits(i - 1, 5), zip_send_bits(p - 4, 4), z = 0; z < p; z++) zip_send_bits(zip_bl_tree[zip_bl_order[z]].dl, 3);
    zip_send_tree(zip_dyn_ltree, _ - 1), zip_send_tree(zip_dyn_dtree, i - 1)
}

function zip_flush_block(_) {
    var i, p, z, e, t;
    if (e = zip_strstart - zip_block_start, zip_flag_buf[zip_last_flags] = zip_flags, zip_build_tree(zip_l_desc), zip_build_tree(zip_d_desc), z = zip_build_bl_tree(), (p = zip_static_len + 3 + 7 >> 3) <= (i = zip_opt_len + 3 + 7 >> 3) && (i = p), e + 4 <= i && zip_block_start >= 0)
        for (zip_send_bits((zip_STORED_BLOCK << 1) + _, 3), zip_bi_windup(), zip_put_short(e), zip_put_short(~e), t = 0; t < e; t++) zip_put_byte(zip_window[zip_block_start + t]);
    else p == i ? (zip_send_bits((zip_STATIC_TREES << 1) + _, 3), zip_compress_block(zip_static_ltree, zip_static_dtree)) : (zip_send_bits((zip_DYN_TREES << 1) + _, 3), zip_send_all_trees(zip_l_desc.max_code + 1, zip_d_desc.max_code + 1, z + 1), zip_compress_block(zip_dyn_ltree, zip_dyn_dtree));
    zip_init_block(), 0 != _ && zip_bi_windup()
}

function zip_ct_tally(_, i) {
    if (zip_l_buf[zip_last_lit++] = i, 0 == _ ? zip_dyn_ltree[i].fc++ : (_--, zip_dyn_ltree[zip_length_code[i] + zip_LITERALS + 1].fc++, zip_dyn_dtree[zip_D_CODE(_)].fc++, zip_d_buf[zip_last_dist++] = _, zip_flags |= zip_flag_bit), zip_flag_bit <<= 1, 0 == (7 & zip_last_lit) && (zip_flag_buf[zip_last_flags++] = zip_flags, zip_flags = 0, zip_flag_bit = 1), zip_compr_level > 2 && 0 == (4095 & zip_last_lit)) {
        var p, z = 8 * zip_last_lit,
            e = zip_strstart - zip_block_start;
        for (p = 0; p < zip_D_CODES; p++) z += zip_dyn_dtree[p].fc * (5 + zip_extra_dbits[p]);
        if (z >>= 3, zip_last_dist < parseInt(zip_last_lit / 2) && z < parseInt(e / 2)) return !0
    }
    return zip_last_lit == zip_LIT_BUFSIZE - 1 || zip_last_dist == zip_DIST_BUFSIZE
}

function zip_compress_block(_, i) {
    var p, z, e, t, a = 0,
        l = 0,
        n = 0,
        r = 0;
    if (0 != zip_last_lit)
        do {
            0 == (7 & a) && (r = zip_flag_buf[n++]), z = 255 & zip_l_buf[a++], 0 == (1 & r) ? zip_SEND_CODE(z, _) : (zip_SEND_CODE((e = zip_length_code[z]) + zip_LITERALS + 1, _), 0 != (t = zip_extra_lbits[e]) && zip_send_bits(z -= zip_base_length[e], t), zip_SEND_CODE(e = zip_D_CODE(p = zip_d_buf[l++]), i), 0 != (t = zip_extra_dbits[e]) && zip_send_bits(p -= zip_base_dist[e], t)), r >>= 1
        } while (a < zip_last_lit);
    zip_SEND_CODE(zip_END_BLOCK, _)
}
var zip_Buf_size = 16;

function zip_send_bits(_, i) {
    zip_bi_valid > zip_Buf_size - i ? (zip_put_short(zip_bi_buf |= _ << zip_bi_valid), zip_bi_buf = _ >> zip_Buf_size - zip_bi_valid, zip_bi_valid += i - zip_Buf_size) : (zip_bi_buf |= _ << zip_bi_valid, zip_bi_valid += i)
}

function zip_bi_reverse(_, i) {
    var p = 0;
    do {
        p |= 1 & _, _ >>= 1, p <<= 1
    } while (--i > 0);
    return p >> 1
}

function zip_bi_windup() {
    zip_bi_valid > 8 ? zip_put_short(zip_bi_buf) : zip_bi_valid > 0 && zip_put_byte(zip_bi_buf), zip_bi_buf = 0, zip_bi_valid = 0
}

function zip_qoutbuf() {
    if (0 != zip_outcnt) {
        var _, i;
        for (_ = zip_new_queue(), null == zip_qhead ? zip_qhead = zip_qtail = _ : zip_qtail = zip_qtail.next = _, _.len = zip_outcnt - zip_outoff, i = 0; i < _.len; i++) _.ptr[i] = zip_outbuf[zip_outoff + i];
        zip_outcnt = zip_outoff = 0
    }
}

function zip_deflate(_, i) {
    var p, z, e, t;
    for (zip_deflate_data = _, zip_deflate_pos = 0, void 0 === i && (i = zip_DEFAULT_LEVEL), zip_deflate_start(i), z = new Array(1024), p = "";
        (e = zip_deflate_internal(z, 0, z.length)) > 0;)
        for (t = 0; t < e; t++) p += String.fromCharCode(z[t]);
    return zip_deflate_data = null, p
}

function encode64(_) {
    for (r = "", i = 0; i < _.length; i += 3) i + 2 == _.length ? r += append3bytes(_.charCodeAt(i), _.charCodeAt(i + 1), 0) : i + 1 == _.length ? r += append3bytes(_.charCodeAt(i), 0, 0) : r += append3bytes(_.charCodeAt(i), _.charCodeAt(i + 1), _.charCodeAt(i + 2));
    return r
}

function append3bytes(_, i, p) {
    return c1 = _ >> 2, c2 = (3 & _) << 4 | i >> 4, c3 = (15 & i) << 2 | p >> 6, c4 = 63 & p, r = "", r += encode6bit(63 & c1), r += encode6bit(63 & c2), r += encode6bit(63 & c3), r += encode6bit(63 & c4), r
}

function encode6bit(_) {
    return _ < 10 ? String.fromCharCode(48 + _) : (_ -= 10) < 26 ? String.fromCharCode(65 + _) : (_ -= 26) < 26 ? String.fromCharCode(97 + _) : 0 == (_ -= 26) ? "-" : 1 == _ ? "_" : "?"
}
GID = function(_) {
    return document.getElementById(_)
};